using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AMTSolutions.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectWebsiteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowOnPublicWebsite",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteCategory",
                table: "Projects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowOnPublicWebsite",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "WebsiteCategory",
                table: "Projects");
        }
    }
}
