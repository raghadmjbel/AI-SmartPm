namespace SmartPm.Api.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public List<CreateProjectSpecificationDto> Specifications { get; set; }
        public List<ProjectArtifactDto> Artifacts { get; set; }
    }
}