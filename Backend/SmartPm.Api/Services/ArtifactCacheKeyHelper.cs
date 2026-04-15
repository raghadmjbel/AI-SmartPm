using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using SmartPm.Api.DTOs;
using SmartPm.Api.Models;

namespace SmartPm.Api.Services
{
    public static class ArtifactCacheKeyHelper
    {
        private static readonly Regex _whitespaceRegex = new(@"\s+", RegexOptions.Compiled);

        public static string BuildKey(int projectId, ArtifactType artifactType, AiFullContextDto context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));

            var normalizedContext = new
            {
                projectName = NormalizeString(context.ProjectName),
                scope = NormalizeString(context.Scope),
                requirements = NormalizeString(context.Requirements),
                constraints = NormalizeString(context.Constraints),
                contextArtifacts = context.ContextArtifacts
                    .OrderBy(a => a.Type)
                    .Select(a => new { type = a.Type, content = NormalizeString(a.Content) })
            };

            var json = JsonSerializer.Serialize(normalizedContext, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            var hash = ComputeSha256Hash(json);
            return $"artifact:{projectId}:{artifactType}:{hash}";
        }

        private static string NormalizeString(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            var trimmed = value.Trim();
            return _whitespaceRegex.Replace(trimmed, " ");
        }

        private static string ComputeSha256Hash(string value)
        {
            using var sha = SHA256.Create();
            var data = Encoding.UTF8.GetBytes(value);
            var hashBytes = sha.ComputeHash(data);
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }
    }
}
