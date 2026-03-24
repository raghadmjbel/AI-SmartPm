namespace SmartPm.Api.Options
{
    public class AIServiceOptions
    {
        public string BaseUrl { get; set; } = "http://ai-service:8000";
        public int TimeoutSeconds { get; set; } = 60;
        public int MaxRetries { get; set; } = 3;
    }

    public class RateLimitingOptions
    {
        public int PermitLimit { get; set; } = 10;
        public int WindowSeconds { get; set; } = 60;
        public int RequestsPerMinute { get; set; } = 60;
        public int BurstCapacity { get; set; } = 20;
    }
}