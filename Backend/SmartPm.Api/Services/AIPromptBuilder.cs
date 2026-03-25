using SmartPm.Api.DTOs;

namespace SmartPm.Api.Services
{
    public interface IAIPromptBuilder 
    {
        string BuildWbsPrompt(AiFullContextDto context);
        string BuildTasksPrompt(AiFullContextDto context);
        string BuildRisksPrompt(AiFullContextDto context);
        string BuildUserStoriesPrompt(AiFullContextDto context);
        string BuildGanttPrompt(AiFullContextDto context);
    }

    public class AIPromptBuilder : IAIPromptBuilder
    {
        public string BuildWbsPrompt(AiFullContextDto context)
        {
            return $@"{context.Scope} {context.Requirements} {context.Constraints}";}

        public string BuildTasksPrompt(AiFullContextDto context)
        {
            return $@"{context.Scope} {context.Requirements} {context.Constraints}";}

        public string BuildRisksPrompt(AiFullContextDto context)
        {
            return $@"{context.Scope} {context.Requirements} {context.Constraints}";}

        public string BuildUserStoriesPrompt(AiFullContextDto context)
        {
            return $@"{context.Scope} {context.Requirements} {context.Constraints}";}

        public string BuildGanttPrompt(AiFullContextDto context)
        {
            return $@"{context.Scope} {context.Requirements} {context.Constraints}";}
    }
}