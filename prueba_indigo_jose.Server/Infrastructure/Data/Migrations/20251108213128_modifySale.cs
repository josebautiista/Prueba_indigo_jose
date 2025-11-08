using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace prueba_indigo_jose.Server.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class modifySale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Clients_ClientIdentification",
                schema: "jbautista",
                table: "Sales");

            migrationBuilder.RenameColumn(
                name: "Value",
                schema: "jbautista",
                table: "Sales",
                newName: "TotalValue");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                schema: "jbautista",
                table: "Sales",
                newName: "TotalItems");

            migrationBuilder.AlterColumn<string>(
                name: "ClientIdentification",
                schema: "jbautista",
                table: "Sales",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<int>(
                name: "ClientId",
                schema: "jbautista",
                table: "Sales",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Clients_ClientIdentification",
                schema: "jbautista",
                table: "Sales",
                column: "ClientIdentification",
                principalSchema: "jbautista",
                principalTable: "Clients",
                principalColumn: "Identification");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Clients_ClientIdentification",
                schema: "jbautista",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "ClientId",
                schema: "jbautista",
                table: "Sales");

            migrationBuilder.RenameColumn(
                name: "TotalValue",
                schema: "jbautista",
                table: "Sales",
                newName: "Value");

            migrationBuilder.RenameColumn(
                name: "TotalItems",
                schema: "jbautista",
                table: "Sales",
                newName: "Quantity");

            migrationBuilder.AlterColumn<string>(
                name: "ClientIdentification",
                schema: "jbautista",
                table: "Sales",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Clients_ClientIdentification",
                schema: "jbautista",
                table: "Sales",
                column: "ClientIdentification",
                principalSchema: "jbautista",
                principalTable: "Clients",
                principalColumn: "Identification",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
