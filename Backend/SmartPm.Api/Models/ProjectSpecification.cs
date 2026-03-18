namespace SmartPm.Api.Models
{
    public class ProjectSpecification
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }

        public string Requirements { get; set; }
        public string Constraints { get; set; }

        public Project Project { get; set; }
    }
}