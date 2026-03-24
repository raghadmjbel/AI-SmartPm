namespace SmartPm.Api.Models
{
    public class ProjectArtifact
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }

        public ArtifactType Type { get; set; }
        public string ContentJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Version { get; set; } = 1;

        public Project Project { get; set; }
    }
}