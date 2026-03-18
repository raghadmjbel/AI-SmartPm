namespace SmartPm.Api.Models
{
    public class ProjectArtifact
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }

        public string Type { get; set; } // WBS, Tasks, Gantt...
        public string Content { get; set; } // JSON

        public Project Project { get; set; }
    }
}