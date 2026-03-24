using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPm.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVersionToProjectArtifacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "ProjectArtifacts",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Version",
                table: "ProjectArtifacts");
        }
    }
}
