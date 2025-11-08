using Microsoft.EntityFrameworkCore;
using prueba_indigo_jose.Server.Application.Services;
using prueba_indigo_jose.Server.Core.Interfaces;
using prueba_indigo_jose.Server.Infrastructure.Data;
using prueba_indigo_jose.Server.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("PruebaIndigo");
var userSchema = "jbautista";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
);

builder.Services.AddScoped(sp =>
{
    var options = sp.GetRequiredService<DbContextOptions<AppDbContext>>();
    return new AppDbContext(options, schema: userSchema);
});

builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<ISaleStatusRepository, SaleStatusRepository>();
builder.Services.AddScoped<SaleStatusService>();
builder.Services.AddScoped<ISaleRepository, SaleRepository>();
builder.Services.AddScoped<SaleService>();
builder.Services.AddScoped<ISaleDetailRepository, SaleDetailRepository>();
builder.Services.AddScoped<SaleDetailService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
