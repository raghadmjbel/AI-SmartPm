using System.Text.Json;
using SmartPm.Api.DTOs;
using Microsoft.Extensions.Logging;

namespace SmartPm.Api.Services
{
    public interface IAIResponseValidator
    {
        bool TryValidateWbsResponse(string jsonResponse, out WbsDto result);
        bool TryValidateTasksResponse(string jsonResponse, out TasksDto result);
        bool TryValidateRisksResponse(string jsonResponse, out RisksDto result);
        bool TryValidateUserStoriesResponse(string jsonResponse, out UserStoriesDto result);
        bool TryValidateGanttResponse(string jsonResponse, out GanttDto result);
    }

    public class AIResponseValidator : IAIResponseValidator
    {
        private readonly ILogger<AIResponseValidator> _logger;

        public AIResponseValidator(ILogger<AIResponseValidator> logger)
        {
            _logger = logger;
        }

        private static JsonSerializerOptions SerializerOptions => new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true
        };

        public bool TryValidateWbsResponse(string jsonResponse, out WbsDto result)
        {
            result = null;
            try
            {
                result = JsonSerializer.Deserialize<WbsDto>(jsonResponse, SerializerOptions);

                if (result?.Wbs == null || !result.Wbs.Any())
                {
                    _logger.LogWarning("WBS response validation failed: No WBS items found");
                    return false;
                }

                var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                bool ValidateNode(WbsItemDto node, HashSet<string> ancestors)
                {
                    if (node == null || string.IsNullOrWhiteSpace(node.Id) || string.IsNullOrWhiteSpace(node.Name))
                    {
                        return false;
                    }

                    if (seen.Contains(node.Id))
                    {
                        _logger.LogWarning("WBS response validation failed: Duplicate WBS id found: {Id}", node.Id);
                        return false;
                    }

                    if (ancestors.Contains(node.Id))
                    {
                        _logger.LogWarning("WBS response validation failed: Cyclic hierarchy detected at {Id}", node.Id);
                        return false;
                    }

                    seen.Add(node.Id);

                    if (node.Children != null)
                    {
                        var nextAncestors = new HashSet<string>(ancestors) { node.Id };
                        foreach (var child in node.Children)
                        {
                            if (!ValidateNode(child, nextAncestors))
                            {
                                return false;
                            }
                        }
                    }

                    return true;
                }

                foreach (var root in result.Wbs)
                {
                    if (!ValidateNode(root, new HashSet<string>(StringComparer.OrdinalIgnoreCase)))
                        return false;
                }

                return true;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "WBS response JSON parsing failed");
                return false;
            }
        }

        public bool TryValidateTasksResponse(string jsonResponse, out TasksDto result)
        {
            result = null;
            try
            {
                result = JsonSerializer.Deserialize<TasksDto>(jsonResponse, SerializerOptions);

                if (result?.Tasks == null || !result.Tasks.Any())
                {
                    _logger.LogWarning("Tasks response validation failed: No tasks found");
                    return false;
                }

                var seenIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var task in result.Tasks)
                {
                    if (task == null || string.IsNullOrWhiteSpace(task.Id) || string.IsNullOrWhiteSpace(task.Name))
                    {
                        _logger.LogWarning("Tasks response validation failed: Invalid task shape");
                        return false;
                    }

                    if (task.DurationDays <= 0)
                    {
                        _logger.LogWarning("Tasks response validation failed: Task {Id} has non-positive duration", task.Id);
                        return false;
                    }

                    if (!seenIds.Add(task.Id))
                    {
                        _logger.LogWarning("Tasks response validation failed: Duplicate task id found: {Id}", task.Id);
                        return false;
                    }
                }

                return true;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Tasks response JSON parsing failed");
                return false;
            }
        }

        public bool TryValidateRisksResponse(string jsonResponse, out RisksDto result)
        {
            result = null;
            try
            {
                result = JsonSerializer.Deserialize<RisksDto>(jsonResponse, SerializerOptions);

                if (result?.Risks == null || !result.Risks.Any())
                {
                    _logger.LogWarning("Risks response validation failed: No risks found");
                    return false;
                }

                foreach (var risk in result.Risks)
                {
                    if (risk == null || string.IsNullOrWhiteSpace(risk.Id) || string.IsNullOrWhiteSpace(risk.Name))
                    {
                        _logger.LogWarning("Risks response validation failed: Invalid risk details");
                        return false;
                    }

                    if (risk.Probability < 0 || risk.Probability > 1)
                    {
                        _logger.LogWarning("Risks response validation failed: Probability out of range for risk {Id}", risk.Id);
                        return false;
                    }
                }

                return true;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Risks response JSON parsing failed");
                return false;
            }
        }

        public bool TryValidateUserStoriesResponse(string jsonResponse, out UserStoriesDto result)
        {
            result = null;
            try
            {
                result = JsonSerializer.Deserialize<UserStoriesDto>(jsonResponse, SerializerOptions);

                if (result?.UserStories == null || !result.UserStories.Any())
                {
                    _logger.LogWarning("User stories response validation failed: No user stories found");
                    return false;
                }

                foreach (var story in result.UserStories)
                {
                    if (story == null || string.IsNullOrWhiteSpace(story.Id) || string.IsNullOrWhiteSpace(story.Role) ||
                        string.IsNullOrWhiteSpace(story.Goal) || string.IsNullOrWhiteSpace(story.Benefit) ||
                        story.AcceptanceCriteria == null || !story.AcceptanceCriteria.Any())
                    {
                        _logger.LogWarning("User stories response validation failed: Invalid story structure");
                        return false;
                    }
                }

                return true;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "User stories response JSON parsing failed");
                return false;
            }
        }

        public bool TryValidateGanttResponse(string jsonResponse, out GanttDto result)
        {
            result = null;
            try
            {
                result = JsonSerializer.Deserialize<GanttDto>(jsonResponse, SerializerOptions);

                if (result?.Gantt?.Tasks == null || !result.Gantt.Tasks.Any())
                {
                    _logger.LogWarning("Gantt response validation failed: No tasks found");
                    return false;
                }

                var taskIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var task in result.Gantt.Tasks)
                {
                    if (task == null || string.IsNullOrWhiteSpace(task.Id) || string.IsNullOrWhiteSpace(task.Name))
                    {
                        _logger.LogWarning("Gantt response validation failed: Invalid task item");
                        return false;
                    }

                    if (!DateTime.TryParse(task.StartDate, out var startDate))
                    {
                        _logger.LogWarning("Gantt response validation failed: Invalid start_date format for task {Id}", task.Id);
                        return false;
                    }

                    if (!DateTime.TryParse(task.EndDate, out var endDate))
                    {
                        _logger.LogWarning("Gantt response validation failed: Invalid end_date format for task {Id}", task.Id);
                        return false;
                    }

                    if (endDate <= startDate)
                    {
                        _logger.LogWarning("Gantt response validation failed: end_date is not after start_date for task {Id}", task.Id);
                        return false;
                    }

                    if (!taskIds.Add(task.Id))
                    {
                        _logger.LogWarning("Gantt response validation failed: Duplicate task id found: {Id}", task.Id);
                        return false;
                    }
                }

                // Circular dependency detection
                var graph = result.Gantt.Tasks.ToDictionary(t => t.Id, t => t.Dependencies ?? new List<string>(), StringComparer.OrdinalIgnoreCase);
                var visited = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                var stackSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                bool HasCycle(string current)
                {
                    if (!graph.ContainsKey(current))
                        return false;

                    if (stackSet.Contains(current))
                        return true;

                    if (visited.Contains(current))
                        return false;

                    visited.Add(current);
                    stackSet.Add(current);

                    foreach (var dependency in graph[current])
                    {
                        if (!string.IsNullOrWhiteSpace(dependency) && HasCycle(dependency))
                            return true;
                    }

                    stackSet.Remove(current);
                    return false;
                }

                foreach (var taskId in graph.Keys)
                {
                    if (HasCycle(taskId))
                    {
                        _logger.LogWarning("Gantt response validation failed: Circular dependency detected involving task {Id}", taskId);
                        return false;
                    }
                }

                // Validate milestones
                var milestoneIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                if (result.Gantt.Milestones != null)
                {
                    foreach (var milestone in result.Gantt.Milestones)
                    {
                        if (milestone == null || string.IsNullOrWhiteSpace(milestone.Id) || string.IsNullOrWhiteSpace(milestone.Name))
                        {
                            _logger.LogWarning("Gantt response validation failed: Invalid milestone item");
                            return false;
                        }
                        if (!DateTime.TryParse(milestone.Date, out var milestoneDate))
                        {
                            _logger.LogWarning("Gantt response validation failed: Invalid date format for milestone {Id}", milestone.Id);
                            return false;
                        }
                        if (!milestoneIds.Add(milestone.Id))
                        {
                            _logger.LogWarning("Gantt response validation failed: Duplicate milestone id found: {Id}", milestone.Id);
                            return false;
                        }
                    }
                }
                // Ensure no overlap between task and milestone IDs
                foreach (var tid in taskIds)
                {
                    if (milestoneIds.Contains(tid))
                    {
                        _logger.LogWarning("Gantt response validation failed: Task and milestone share the same id: {Id}", tid);
                        return false;
                    }
                }
                return true;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Gantt response JSON parsing failed");
                return false;
            }
        }
    }
}