using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AMTSolutions.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicPortfolioChallengeSolution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicPortfolioChallenge",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicPortfolioSolution",
                table: "Projects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicPortfolioChallenge",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "PublicPortfolioSolution",
                table: "Projects");
        }
    }
}
