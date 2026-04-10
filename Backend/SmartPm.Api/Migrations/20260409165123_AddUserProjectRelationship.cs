using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPm.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProjectRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('Projects','UserId') IS NULL
BEGIN
    ALTER TABLE [Projects] ADD [UserId] int NULL;
END
ELSE
BEGIN
    DECLARE @defaultConstraint sysname;
    SELECT @defaultConstraint = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.default_object_id = dc.object_id
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'Projects' AND c.name = 'UserId';

    IF @defaultConstraint IS NOT NULL
        EXEC('ALTER TABLE [Projects] DROP CONSTRAINT [' + @defaultConstraint + ']');

    IF (SELECT is_nullable FROM sys.columns WHERE object_id = OBJECT_ID('Projects') AND name = 'UserId') = 0
        ALTER TABLE [Projects] ALTER COLUMN [UserId] int NULL;
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM [Users])
BEGIN
    INSERT INTO [Users] ([Username], [Email], [PasswordHash], [CreatedAt])
    VALUES ('default', 'default@local', '', GETUTCDATE());
END
");

            migrationBuilder.Sql(@"
EXEC('UPDATE [Projects]
SET [UserId] = (SELECT TOP 1 [Id] FROM [Users] ORDER BY [Id])
WHERE [UserId] IS NULL OR [UserId] = 0');
");

            migrationBuilder.Sql(@"
EXEC('ALTER TABLE [Projects] ALTER COLUMN [UserId] int NOT NULL');
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('Projects') AND name = 'IX_Projects_UserId')
BEGIN
    CREATE INDEX [IX_Projects_UserId] ON [Projects] ([UserId]);
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('Projects') AND name = 'FK_Projects_Users_UserId')
BEGIN
    ALTER TABLE [Projects]
    ADD CONSTRAINT [FK_Projects_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('Projects') AND name = 'FK_Projects_Users_UserId')
BEGIN
    ALTER TABLE [Projects] DROP CONSTRAINT [FK_Projects_Users_UserId];
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('Projects') AND name = 'IX_Projects_UserId')
BEGIN
    DROP INDEX [IX_Projects_UserId] ON [Projects];
END

IF COL_LENGTH('Projects','UserId') IS NOT NULL
BEGIN
    ALTER TABLE [Projects] DROP COLUMN [UserId];
END
");
        }
    }
}
