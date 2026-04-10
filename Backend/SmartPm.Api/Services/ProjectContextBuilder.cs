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
                .Select(s => s.Requirements)
                .Where(x => !string.IsNullOrWhiteSpace(x)));

            var constraints = string.Join(" ", project.ProjectSpecifications
                .Select(s => s.Constraints)
                .Where(x => !string.IsNullOrWhiteSpace(x)));

            var contextArtifacts = await _context.ProjectArtifacts
                .Where(a => a.ProjectId == projectId && (!excludeArtifactType.HasValue || a.Type != excludeArtifactType.Value))
                .GroupBy(a => a.Type)
                .Select(g => g
                    .OrderByDescending(a => a.Version)
                    .First())
                .Select(a => new ContextArtifactDto
                {
                    Type = a.Type.ToString(),
                    Content = a.ContentJson
                })
                .ToListAsync();

            return new AiFullContextDto
            {
                ProjectId = projectId,
                Scope = project.Description ?? "",
                Requirements = requirements,
                Constraints = constraints,
                ContextArtifacts = contextArtifacts
            };
        }
    }
}