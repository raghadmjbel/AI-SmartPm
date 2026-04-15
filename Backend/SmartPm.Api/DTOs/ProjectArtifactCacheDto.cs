using System;
using SmartPm.Api.Models;

namespace SmartPm.Api.DTOs
{
    public class ProjectArtifactCacheDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public ArtifactType Type { get; set; }
        public string ContentJson { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Version { get; set; }
    }
}
