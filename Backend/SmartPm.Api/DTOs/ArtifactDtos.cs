using System.Text.Json.Serialization;

namespace SmartPm.Api.DTOs
{
    public class WbsDto
    {
        [JsonPropertyName("wbs")]
        public List<WbsItemDto> Wbs { get; set; } = new();
    }

    public class WbsItemDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("children")]
        public List<WbsItemDto> Children { get; set; } = new();
    }

    public class TasksDto
    {
        [JsonPropertyName("tasks")]
        public List<TaskItemDto> Tasks { get; set; } = new();
    }

    public class TaskItemDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("durationDays")]
        public int DurationDays { get; set; }

        [JsonPropertyName("priority")]
        public string Priority { get; set; }

        [JsonPropertyName("dependencies")]
        public List<string> Dependencies { get; set; } = new();
    }

    public class RisksDto
    {
        [JsonPropertyName("risks")]
        public List<RiskItemDto> Risks { get; set; } = new();
    }

    public class RiskItemDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("probability")]
        public double Probability { get; set; }

        [JsonPropertyName("impact")]
        public string Impact { get; set; }

        [JsonPropertyName("mitigation")]
        public string Mitigation { get; set; }
    }

    public class UserStoriesDto
    {
        [JsonPropertyName("user_stories")]
        public List<UserStoryDto> UserStories { get; set; } = new();
    }

    public class UserStoryDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("role")]
        public string Role { get; set; }

        [JsonPropertyName("goal")]
        public string Goal { get; set; }

        [JsonPropertyName("benefit")]
        public string Benefit { get; set; }

        [JsonPropertyName("acceptance_criteria")]
        public List<string> AcceptanceCriteria { get; set; } = new();
    }

    public class GanttDto
    {
        [JsonPropertyName("gantt")]
        public GanttDataDto Gantt { get; set; } = new();
    }

    public class GanttDataDto
    {
        [JsonPropertyName("tasks")]
        public List<GanttTaskDto> Tasks { get; set; } = new();

        [JsonPropertyName("milestones")]
        public List<GanttMilestoneDto> Milestones { get; set; } = new();
    }

    public class GanttTaskDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("start_date")]
        public string StartDate { get; set; }

        [JsonPropertyName("end_date")]
        public string EndDate { get; set; }

        [JsonPropertyName("dependencies")]
        public List<string> Dependencies { get; set; } = new();
    }

    public class GanttMilestoneDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("date")]
        public string Date { get; set; }
    }
}