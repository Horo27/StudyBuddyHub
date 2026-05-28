using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyBuddyHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Subjects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Subjects");
        }
    }
}
