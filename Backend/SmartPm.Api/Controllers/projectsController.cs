using Microsoft.AspNetCore.Mvc;
using SmartPm.Api.Data;
using SmartPm.Api.Models;
using SmartPm.Api.DTOs;
using SmartPm.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SmartPm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IArtifactGenerationService _artifactGenerationService;
        private readonly IProjectContextBuilder _projectContextBuilder;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(AppDbContext context, IArtifactGenerationService artifactGenerationService, IProjectContextBuilder projectContextBuilder, ILogger<ProjectsController> logger)
        {
            _context = context;
            _artifactGenerationService = artifactGenerationService;
            _projectContextBuilder = projectContextBuilder;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }

        // GET: api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
        {
            var userId = GetCurrentUserId();
            var projects = await _context.Projects
                .Where(p => p.UserId == userId)
                .Include(p => p.ProjectSpecifications)
                .Include(p => p.ProjectArtifacts)
                .ToListAsync();

            var result = projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Specifications = p.ProjectSpecifications.Select(s => new CreateProjectSpecificationDto
                {
                    Id = s.Id,
                    Requirements = s.Requirements,
                    Constraints = s.Constraints
                }).ToList(),
                Artifacts = p.ProjectArtifacts.Select(a => new ProjectArtifactDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    ContentJson = a.ContentJson,
                    CreatedAt = a.CreatedAt,
                    Version = a.Version
                }).ToList()
            });

            return Ok(result);
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProject(int id)
        {
            var userId = GetCurrentUserId();
            var p = await _context.Projects
                .Where(p => p.UserId == userId)
                .Include(p => p.ProjectSpecifications)
                .Include(p => p.ProjectArtifacts)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null) return NotFound();

            var result = new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Specifications = p.ProjectSpecifications.Select(s => new CreateProjectSpecificationDto
                {
                    Id = s.Id,
                    Requirements = s.Requirements,
                    Constraints = s.Constraints
                }).ToList(),
                Artifacts = p.ProjectArtifacts.Select(a => new ProjectArtifactDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    ContentJson = a.ContentJson,
                    CreatedAt = a.CreatedAt,
                    Version = a.Version
                }).ToList()
            };

            return Ok(result);
        }
        
        // POST: api/projects
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(CreateProjectDto dto)
        {
            var userId = GetCurrentUserId();
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        // PUT: api/projects/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Project>> UpdateProject(int id, CreateProjectDto dto)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null) return NotFound("Project not found");

            project.Name = dto.Name;
            project.Description = dto.Description;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        // DELETE: api/projects/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProject(int id)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects
                .Where(p => p.UserId == userId)
                .Include(p => p.ProjectSpecifications)
                .Include(p => p.ProjectArtifacts)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound("Project not found");

            // حذف كل التبعيات
            _context.ProjectSpecifications.RemoveRange(project.ProjectSpecifications);
            _context.ProjectArtifacts.RemoveRange(project.ProjectArtifacts);
            _context.Projects.Remove(project);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/projects/{id}/generate/{type}
        [HttpPost("{id}/generate/{type}")]
        public async Task<ActionResult<ProjectArtifactDto>> GenerateArtifact(int id, string type, [FromQuery] bool force = false, CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound("Project not found");

            if (!Enum.TryParse<ArtifactType>(type, true, out var artifactType))
                return BadRequest("Invalid artifact type");

            // Optional cache: if artifact already exists, return latest version directly
            var cachedArtifact = await _context.ProjectArtifacts
                .Where(a => a.ProjectId == id && a.Type == artifactType)
                .OrderByDescending(a => a.Version)
                .FirstOrDefaultAsync(cancellationToken);

            if (!force && cachedArtifact != null)
            {
                var cachedDto = new ProjectArtifactDto
                {
                    Id = cachedArtifact.Id,
                    Type = cachedArtifact.Type,
                    ContentJson = cachedArtifact.ContentJson,
                    CreatedAt = cachedArtifact.CreatedAt,
                    Version = cachedArtifact.Version
                };

                _logger.LogInformation("Artifact cache hit for Project {ProjectId}, type {ArtifactType}, version {Version}", id, artifactType, cachedArtifact.Version);
                return Ok(cachedDto);
            }


            var context = await _projectContextBuilder.BuildContextAsync(id);

            object artifactData;
            try
            {
                artifactData = artifactType switch
                {
                    ArtifactType.WBS => await _artifactGenerationService.GenerateWbsAsync(context, cancellationToken),
                    ArtifactType.TaskList => await _artifactGenerationService.GenerateTasksAsync(context, cancellationToken),
                    ArtifactType.Gantt => await _artifactGenerationService.GenerateGanttAsync(context, cancellationToken),
                    ArtifactType.RiskRegister => await _artifactGenerationService.GenerateRisksAsync(context, cancellationToken),
                    ArtifactType.UserStories => await _artifactGenerationService.GenerateUserStoriesAsync(context, cancellationToken),
                    _ => throw new ArgumentException("Unsupported artifact type")
                };
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, $"AI service error: {ex.Message}");
            }
            catch (OperationCanceledException)
            {
                return StatusCode(499, "Request cancelled");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal error: {ex.Message}");
            }

            var latestVersion = await _context.ProjectArtifacts
                .Where(a => a.ProjectId == id && a.Type == artifactType)
                .OrderByDescending(a => a.Version)
                .Select(a => a.Version)
                .FirstOrDefaultAsync();

            
            var contentJson = JsonSerializer.Serialize(artifactData, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            var artifact = new ProjectArtifact
            {
                ProjectId = id,
                Type = artifactType,
                ContentJson = contentJson,
                CreatedAt = DateTime.UtcNow,
                Version = latestVersion + 1
            };

            _context.ProjectArtifacts.Add(artifact);
            await _context.SaveChangesAsync();

            var dto = new ProjectArtifactDto
            {
                Id = artifact.Id,
                Type = artifact.Type,
                ContentJson = artifact.ContentJson,
                CreatedAt = artifact.CreatedAt,
                Version = artifact.Version
            };

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, dto);
        }

        // GET: api/projects/{id}/artifacts
        [HttpGet("{id}/artifacts")]
        public async Task<ActionResult<IEnumerable<ProjectArtifactDto>>> GetProjectArtifacts(int id, CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound("Project not found");

            var artifacts = await _context.ProjectArtifacts
                .Where(a => a.ProjectId == id)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            var result = artifacts.Select(a => new ProjectArtifactDto
            {
                Id = a.Id,
                Type = a.Type,
                ContentJson = a.ContentJson,
                CreatedAt = a.CreatedAt,
                Version = a.Version
            });

            return Ok(result);
        }

        // GET: api/projects/{id}/artifacts/{type}
        [HttpGet("{id}/artifacts/{type}")]
        public async Task<ActionResult<ProjectArtifactDto>> GetProjectArtifact(int id, string type, CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound("Project not found");

            if (!Enum.TryParse<ArtifactType>(type, true, out var artifactType))
                return BadRequest("Invalid artifact type");

            var artifact = await _context.ProjectArtifacts
                .Where(a => a.ProjectId == id && a.Type == artifactType)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (artifact == null)
                return NotFound("Artifact not found");

            var dto = new ProjectArtifactDto
            {
                Id = artifact.Id,
                Type = artifact.Type,
                ContentJson = artifact.ContentJson,
                CreatedAt = artifact.CreatedAt,
                Version = artifact.Version
            };

            return Ok(dto);
        }

        // POST: api/projects/{id}/projectspecifications
        [HttpPost("{id}/projectspecifications")]
        public async Task<ActionResult<ProjectSpecification>> AddProjectSpecification(int id, CreateProjectSpecificationDto dto)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null) return NotFound("Project not found");

            var spec = new ProjectSpecification
            {
                ProjectId = id,
                Requirements = dto.Requirements,
                Constraints = dto.Constraints
            };
            var specDto = new CreateProjectSpecificationDto
            {
                Id = spec.Id,
                Requirements = spec.Requirements,
                Constraints = spec.Constraints
            };


            _context.ProjectSpecifications.Add(spec);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProject), new { id = id }, specDto);

        }

        // DELETE: api/projects/{projectId}/projectspecifications/{specId}
        [HttpDelete("{projectId}/projectspecifications/{specId}")]
        public async Task<ActionResult> DeleteProjectSpecification(int projectId, int specId)
        {
            var userId = GetCurrentUserId();
            var spec = await _context.ProjectSpecifications
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == specId && s.ProjectId == projectId && s.Project.UserId == userId);
            if (spec == null) return NotFound("Specification not found");

            _context.ProjectSpecifications.Remove(spec);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/projects/{projectId}/projectartifacts/{artifactId}
        [HttpDelete("{projectId}/projectartifacts/{artifactId}")]
        public async Task<ActionResult> DeleteProjectArtifact(int projectId, int artifactId)
        {
            var userId = GetCurrentUserId();
            var artifact = await _context.ProjectArtifacts
                .Include(a => a.Project)
                .FirstOrDefaultAsync(a => a.Id == artifactId && a.ProjectId == projectId && a.Project.UserId == userId);
            if (artifact == null) return NotFound("Artifact not found");

            _context.ProjectArtifacts.Remove(artifact);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}