using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using SmartPm.Api.DTOs;

namespace SmartPm.Api.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private const string AiUrl = "http://ai-service:8000/predict";

        public AiService(HttpClient httpClient)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        }

        public async Task<AiResponseDto> AnalyzeAsync(AiRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var requestJson = JsonSerializer.Serialize(request, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            using var httpContent = new StringContent(requestJson, Encoding.UTF8, "application/json");
            using var response = await _httpClient.PostAsync(AiUrl, httpContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"AI service failed with {(int)response.StatusCode} {response.ReasonPhrase}. Body: {errorBody}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(responseBody))
                throw new InvalidOperationException("AI service returned an empty response body.");

            var aiResponse = JsonSerializer.Deserialize<AiResponseDto>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (aiResponse == null)
                throw new JsonException("Unable to deserialize AI service response.");

            return aiResponse;
        }
    }
}
