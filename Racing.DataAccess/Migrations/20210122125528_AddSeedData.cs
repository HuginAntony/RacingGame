using Microsoft.EntityFrameworkCore.Migrations;

namespace Racing.DataAccess.Migrations
{
    public partial class AddSeedData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Car",
                columns: new[] { "Id", "Acceleration", "Braking", "CorneringAbility", "Name", "TopSpeed" },
                values: new object[,]
                {
                    { 1, 8, 3, 4, "CORV", 9 },
                    { 2, 6, 7, 9, "GTR", 8 },
                    { 3, 7, 4, 4, "MUSTANG", 9 }
                });

            migrationBuilder.InsertData(
                table: "Track",
                columns: new[] { "Id", "Name", "TrackPath" },
                values: new object[,]
                {
                    { 1, "Yas Marina", "11110011100011001110011101" },
                    { 2, "Daytona", "11111111001111110111100001" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Car",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Car",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Car",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Track",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Track",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
