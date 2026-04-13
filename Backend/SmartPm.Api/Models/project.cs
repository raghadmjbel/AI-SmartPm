namespace SmartPm.Api.Models
{
    public class Project
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string Description { get; set; } // Scope 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public List<ProjectSpecification> ProjectSpecifications { get; set; }
        public List<ProjectArtifact> ProjectArtifacts { get; set; }
    }
}
