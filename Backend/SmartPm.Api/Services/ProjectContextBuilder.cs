using SmartPm.Api.Data;
using SmartPm.Api.DTOs;
using SmartPm.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace SmartPm.Api.Services
{
    public interface IProjectContextBuilder
    {
        Task<AiFullContextDto> BuildContextAsync(int projectId);
    }

    public class ProjectContextBuilder : IProjectContextBuilder
    {
        private readonly AppDbContext _context;

        public ProjectContextBuilder(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AiFullContextDto> BuildContextAsync(int projectId)
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

            return new AiFullContextDto // no !!
            {
                ProjectId = projectId,
                Scope = project.Description ?? "",
                Requirements = requirements,
                Constraints = constraints
            };
        }
    }
}