using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPm.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateArtifactModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Content",
                table: "ProjectArtifacts",
                newName: "ContentJson");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "ProjectArtifacts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ProjectArtifacts");

            migrationBuilder.RenameColumn(
                name: "ContentJson",
                table: "ProjectArtifacts",
                newName: "Content");
        }
    }
}
