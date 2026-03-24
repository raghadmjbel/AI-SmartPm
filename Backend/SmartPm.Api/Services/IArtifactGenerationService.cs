using System.Threading.Tasks;
using SmartPm.Api.DTOs;

namespace SmartPm.Api.Services
{
    public interface IArtifactGenerationService
    {
        Task<WbsDto> GenerateWbsAsync(AiFullContextDto context, CancellationToken cancellationToken = default);
        Task<TasksDto> GenerateTasksAsync(AiFullContextDto context, CancellationToken cancellationToken = default);
        Task<RisksDto> GenerateRisksAsync(AiFullContextDto context, CancellationToken cancellationToken = default);
        Task<UserStoriesDto> GenerateUserStoriesAsync(AiFullContextDto context, CancellationToken cancellationToken = default);
        Task<GanttDto> GenerateGanttAsync(AiFullContextDto context, CancellationToken cancellationToken = default);
    }
}