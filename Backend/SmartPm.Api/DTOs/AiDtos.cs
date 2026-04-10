using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SmartPm.Api.DTOs
{
    public class AiRequestDto
    {
        [JsonPropertyName("projectId")]
        public int ProjectId { get; set; }

        [JsonPropertyName("task_description")]
        public string TaskDescription { get; set; }

        [JsonPropertyName("priority_level")]
        public string PriorityLevel { get; set; }
    }

    public class AiFullContextDto
    {
        [JsonPropertyName("projectId")]
        public int ProjectId { get; set; }

        [JsonPropertyName("scope")]
        public string Scope { get; set; }

        [JsonPropertyName("requirements")]
        public string Requirements { get; set; }

        [JsonPropertyName("constraints")]
        public string Constraints { get; set; }

        [JsonPropertyName("contextArtifacts")]
        public List<ContextArtifactDto> ContextArtifacts { get; set; } = new();
    }

    public class ContextArtifactDto
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }
    }

    public class AiResponseDto
    {
        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("result")]
        public AiResponseResultDto Result { get; set; }

        [JsonPropertyName("metadata")]
        public AiResponseMetadataDto Metadata { get; set; }
    }

    public class AiResponseResultDto
    {
        [JsonPropertyName("projectId")]
        public int ProjectId { get; set; }

        [JsonPropertyName("analysis")]
        public AiResponseAnalysisDto Analysis { get; set; }
    }

    public class AiResponseAnalysisDto
    {
        [JsonPropertyName("priority")]
        public string Priority { get; set; }

        [JsonPropertyName("score")]
        public double Score { get; set; }

        [JsonPropertyName("recommendation")]
        public string Recommendation { get; set; }
    }

    public class AiResponseMetadataDto
    {
        [JsonPropertyName("model_version")]
        public string ModelVersion { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; }
    }
}
