using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AMTSolutions.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicPortfolioImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicPortfolioImageUrl",
                table: "Projects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicPortfolioImageUrl",
                table: "Projects");
        }
    }
}
