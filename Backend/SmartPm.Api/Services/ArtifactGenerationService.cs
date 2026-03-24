using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using SmartPm.Api.DTOs;
using SmartPm.Api.Models;
using SmartPm.Api.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Retry;

namespace SmartPm.Api.Services
{
    public class ArtifactGenerationService : IArtifactGenerationService
    {
        private delegate bool ArtifactValidator<T>(string jsonResponse, out T result);

        private readonly HttpClient _httpClient;
        private readonly ILogger<ArtifactGenerationService> _logger;
        private readonly IAsyncPolicy<HttpResponseMessage> _policyWrap;
        private readonly IAIPromptBuilder _promptBuilder;
        private readonly IAIResponseValidator _responseValidator;
        private readonly AIServiceOptions _aiServiceOptions;

        public ArtifactGenerationService(
            HttpClient httpClient,
            ILogger<ArtifactGenerationService> logger,
            IAIPromptBuilder promptBuilder,
            IAIResponseValidator responseValidator,
            IOptions<AIServiceOptions> aiServiceOptions)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _promptBuilder = promptBuilder ?? throw new ArgumentNullException(nameof(promptBuilder));
            _responseValidator = responseValidator ?? throw new ArgumentNullException(nameof(responseValidator));
            _aiServiceOptions = aiServiceOptions?.Value ?? throw new ArgumentNullException(nameof(aiServiceOptions));

            var retryPolicy = Policy<HttpResponseMessage>
                .Handle<HttpRequestException>()
                .Or<TaskCanceledException>()
                .OrResult(r => !r.IsSuccessStatusCode)
                .WaitAndRetryAsync(_aiServiceOptions.MaxRetries, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    (outcome, timeSpan, retryCount, context) =>
                    {
                        _logger.LogWarning(outcome.Exception ?? new Exception("HTTP failure"), "AI service call failed. Retry {RetryCount} after {TimeSpan}", retryCount, timeSpan);
                    });

            var circuitBreakerPolicy = Policy<HttpResponseMessage>
                .Handle<HttpRequestException>()
                .Or<TaskCanceledException>()
                .OrResult(r => !r.IsSuccessStatusCode)
                .CircuitBreakerAsync(3, TimeSpan.FromSeconds(30),
                    onBreak: (outcome, ts) =>
                    {
                        _logger.LogWarning("AI service circuit breaker open for {Duration}s due to: {Reason}", ts.TotalSeconds, outcome.Exception?.Message ?? outcome.Result.ReasonPhrase);
                    },
                    onReset: () => _logger.LogInformation("AI service circuit breaker reset"),
                    onHalfOpen: () => _logger.LogInformation("AI service circuit breaker half-open"));

            _policyWrap = Policy.WrapAsync(retryPolicy, circuitBreakerPolicy);
        }

        public async Task<WbsDto> GenerateWbsAsync(AiFullContextDto context, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Generating WBS for project {ProjectId}", context.ProjectId);
            var result = await GenerateArtifactAsync<WbsDto>(context, "wbs", _promptBuilder.BuildWbsPrompt(context), _responseValidator.TryValidateWbsResponse, cancellationToken);
            _logger.LogInformation("WBS generated successfully for project {ProjectId}", context.ProjectId);
            return result;
        }

        public async Task<TasksDto> GenerateTasksAsync(AiFullContextDto context, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Generating tasks for project {ProjectId}", context.ProjectId);
            var result = await GenerateArtifactAsync<TasksDto>(context, "tasks", _promptBuilder.BuildTasksPrompt(context), _responseValidator.TryValidateTasksResponse, cancellationToken);
            _logger.LogInformation("Tasks generated successfully for project {ProjectId}", context.ProjectId);
            return result;
        }

        public async Task<RisksDto> GenerateRisksAsync(AiFullContextDto context, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Generating risks for project {ProjectId}", context.ProjectId);
            var result = await GenerateArtifactAsync<RisksDto>(context, "risks", _promptBuilder.BuildRisksPrompt(context), _responseValidator.TryValidateRisksResponse, cancellationToken);
            _logger.LogInformation("Risks generated successfully for project {ProjectId}", context.ProjectId);
            return result;
        }

        public async Task<UserStoriesDto> GenerateUserStoriesAsync(AiFullContextDto context, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Generating user stories for project {ProjectId}", context.ProjectId);
            var result = await GenerateArtifactAsync<UserStoriesDto>(context, "user-stories", _promptBuilder.BuildUserStoriesPrompt(context), _responseValidator.TryValidateUserStoriesResponse, cancellationToken);
            _logger.LogInformation("User stories generated successfully for project {ProjectId}", context.ProjectId);
            return result;
        }

        public async Task<GanttDto> GenerateGanttAsync(AiFullContextDto context, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Generating Gantt for project {ProjectId}", context.ProjectId);
            var result = await GenerateArtifactAsync<GanttDto>(context, "gantt", _promptBuilder.BuildGanttPrompt(context), _responseValidator.TryValidateGanttResponse, cancellationToken);
            _logger.LogInformation("Gantt generated successfully for project {ProjectId}", context.ProjectId);
            return result;
        }

        private async Task<T> GenerateArtifactAsync<T>(
            AiFullContextDto context,
            string artifactType,
            string prompt,
            ArtifactValidator<T> validator,
            CancellationToken cancellationToken = default) where T : new()
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));

            var requestPayload = new
            {
                prompt = prompt,
                projectId = context.ProjectId,
                scope = context.Scope,
                requirements = context.Requirements,
                constraints = context.Constraints
            };

            var requestJson = JsonSerializer.Serialize(requestPayload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            using var httpContent = new StringContent(requestJson, Encoding.UTF8, "application/json");
            var url = $"{_aiServiceOptions.BaseUrl}/generate/{artifactType}";
            // Only log projectId and artifactType for security
            _logger.LogDebug("Calling AI service at {Url} for project {ProjectId}, type {ArtifactType}", url, context.ProjectId, artifactType);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(_aiServiceOptions.TimeoutSeconds));
            var response = await _policyWrap.ExecuteAsync(async () =>
            {
                return await _httpClient.PostAsync(url, httpContent, cts.Token);
            });

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("AI service returned {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
                throw new HttpRequestException($"AI service failed with {(int)response.StatusCode} {response.ReasonPhrase}. Body: {errorBody}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            // Only log status and length for security
            _logger.LogDebug("AI service response received for project {ProjectId}, type {ArtifactType}, length {Length}", context.ProjectId, artifactType, responseBody?.Length ?? 0);

            if (string.IsNullOrWhiteSpace(responseBody))
                throw new InvalidOperationException("AI service returned an empty response body.");

            // Payload size protection (e.g., 100KB max)
            const int MaxResponseSize = 100_000;
            if (responseBody.Length > MaxResponseSize)
            {
                _logger.LogError("AI response too large: {Length} bytes", responseBody.Length);
                throw new InvalidOperationException("AI service response exceeded maximum allowed size.");
            }

            try
            {
                var aiResponse = JsonSerializer.Deserialize<AiGenerateResponseDto>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (aiResponse == null || aiResponse.Status != "success")
                    throw new InvalidOperationException("AI service returned invalid response structure.");

                var artifactJson = aiResponse.Result;

                // Validate the artifact response
                if (!validator(artifactJson, out T artifact))
                {
                    _logger.LogError("AI response validation failed for artifact type {ArtifactType}", artifactType);
                    throw new InvalidOperationException($"AI service returned invalid {artifactType} structure.");
                }

                // Ensure roundtrip deserialization for type safety
                var contentJson = JsonSerializer.Serialize(artifact, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                var roundTrip = JsonSerializer.Deserialize<T>(contentJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (roundTrip == null)
                {
                    _logger.LogError("AI response roundtrip serialization failed for {ArtifactType}", artifactType);
                    throw new InvalidOperationException("AI response roundtrip serialization failed.");
                }

                return roundTrip;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse AI response JSON");
                throw new InvalidOperationException("AI service returned invalid JSON.", ex);
            }
        }
    }

    public class AiGenerateResponseDto
    {
        public string Status { get; set; }
        public string Result { get; set; }
        public object Metadata { get; set; }
    }
}