using Microsoft.AspNetCore.Mvc;
using SmartPm.Api.Data;
using SmartPm.Api.Models;
using SmartPm.Api.DTOs;
using SmartPm.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace SmartPm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AiService _aiService;

        public ProjectsController(AppDbContext context, AiService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        // GET: api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
        {
            var projects = await _context.Projects
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
                    Content = a.Content
                }).ToList()
            });

            return Ok(result);
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProject(int id)
        {
            var p = await _context.Projects
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
                    Content = a.Content
                }).ToList()
            };

            return Ok(result);
        }
        
        // POST: api/projects
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        // PUT: api/projects/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Project>> UpdateProject(int id, CreateProjectDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
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
            var project = await _context.Projects
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

        // POST: api/projects/{id}/analyze
        [HttpPost("{id}/analyze")]
        public async Task<ActionResult<AiResponseDto>> AnalyzeProject(int id, [FromBody] AiRequestDto requestPayload)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectSpecifications)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
                return NotFound("Project not found");

            var combinedText = string.Join(" ", project.ProjectSpecifications
                .SelectMany(s => new[] { s.Requirements, s.Constraints })
                .Where(x => !string.IsNullOrWhiteSpace(x)));

            var aiRequest = new AiRequestDto
            {
                ProjectId = id,
                TaskDescription = string.IsNullOrWhiteSpace(requestPayload?.TaskDescription)
                    ? combinedText
                    : requestPayload.TaskDescription,
                PriorityLevel = string.IsNullOrWhiteSpace(requestPayload?.PriorityLevel)
                    ? "normal"
                    : requestPayload.PriorityLevel
            };

            var aiResponse = await _aiService.AnalyzeAsync(aiRequest);

            var artifact = new ProjectArtifact
            {
                ProjectId = id,
                Type = "AI_Analysis",
                Content = JsonSerializer.Serialize(aiResponse.Result.Analysis, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                })
            };

            _context.ProjectArtifacts.Add(artifact);
            await _context.SaveChangesAsync();

            return Ok(aiResponse);
        }

        // POST: api/projects/{id}/projectspecifications
        [HttpPost("{id}/projectspecifications")]
        public async Task<ActionResult<ProjectSpecification>> AddProjectSpecification(int id, CreateProjectSpecificationDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
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
            var spec = await _context.ProjectSpecifications
                .FirstOrDefaultAsync(s => s.Id == specId && s.ProjectId == projectId);
            if (spec == null) return NotFound("Specification not found");

            _context.ProjectSpecifications.Remove(spec);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/projects/{projectId}/projectartifacts/{artifactId}
        [HttpDelete("{projectId}/projectartifacts/{artifactId}")]
        public async Task<ActionResult> DeleteProjectArtifact(int projectId, int artifactId)
        {
            var artifact = await _context.ProjectArtifacts
                .FirstOrDefaultAsync(a => a.Id == artifactId && a.ProjectId == projectId);
            if (artifact == null) return NotFound("Artifact not found");

            _context.ProjectArtifacts.Remove(artifact);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}