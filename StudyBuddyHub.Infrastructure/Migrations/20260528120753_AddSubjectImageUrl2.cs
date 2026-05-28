using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyBuddyHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectImageUrl2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl2",
                table: "Subjects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl2",
                table: "Subjects");
        }
    }
}
