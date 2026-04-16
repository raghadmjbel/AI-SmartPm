using SmartPm.Api.Data;
using SmartPm.Api.DTOs;
using SmartPm.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace SmartPm.Api.Services
{
    public interface IProjectContextBuilder
    {
        Task<AiFullContextDto> BuildContextAsync(int projectId, ArtifactType? excludeArtifactType = null);
    }

    public class ProjectContextBuilder : IProjectContextBuilder
    {
        private readonly AppDbContext _context;

        public ProjectContextBuilder(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AiFullContextDto> BuildContextAsync(int projectId, ArtifactType? excludeArtifactType = null)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectSpecifications)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
                throw new ArgumentException("Project not found", nameof(projectId));

            var requirements = string.Join(" ", project.ProjectSpecifications
                .OrderBy(s => s.Id)
                .Select(s => s.Requirements?.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x)));

            var constraints = string.Join(" ", project.ProjectSpecifications
                .OrderBy(s => s.Id)
                .Select(s => s.Constraints?.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x)));

            var contextArtifactsData = await _context.ProjectArtifacts
                .Where(a => a.ProjectId == projectId && (!excludeArtifactType.HasValue || a.Type != excludeArtifactType.Value))
                .OrderByDescending(a => a.Version)
                .ToListAsync();

            var contextArtifacts = contextArtifactsData
                .GroupBy(a => a.Type)
                .Select(g => g.First())
                .Select(a => new ContextArtifactDto
                {
                    Type = a.Type.ToString(),
                    Content = a.ContentJson
                })
                .ToList();

            return new AiFullContextDto
            {
                ProjectId = projectId,
                ProjectName = project.Name ?? string.Empty,
                Scope = project.Description ?? string.Empty,
                Requirements = requirements,
                Constraints = constraints,
                ContextArtifacts = contextArtifacts
            };
        }
    }
}