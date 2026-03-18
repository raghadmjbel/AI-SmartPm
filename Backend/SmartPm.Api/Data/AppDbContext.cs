using Microsoft.EntityFrameworkCore;
using SmartPm.Api.Models;

namespace SmartPm.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectSpecification> ProjectSpecifications { get; set; }
        public DbSet<ProjectArtifact> ProjectArtifacts { get; set; }
    }
}