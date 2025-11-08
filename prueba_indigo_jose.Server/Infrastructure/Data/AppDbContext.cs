using Microsoft.EntityFrameworkCore;
using prueba_indigo_jose.Server.Core.Entities;

namespace prueba_indigo_jose.Server.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        private readonly string _schema;

        public AppDbContext(DbContextOptions<AppDbContext> options, string? schema = null)
            : base(options)
        {
            _schema = schema ?? "jbautista";
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<SaleStatus> SaleStatuses => Set<SaleStatus>();
        public DbSet<Sale> Sales => Set<Sale>();
        public DbSet<SaleDetail> SaleDetails => Set<SaleDetail>();
        public DbSet<Client> Clients => Set<Client>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema(_schema);

            modelBuilder.Entity<Product>().ToTable("Products");
            modelBuilder.Entity<SaleStatus>().ToTable("SaleStatus");
            modelBuilder.Entity<Sale>().ToTable("Sales");
            modelBuilder.Entity<SaleDetail>().ToTable("SaleDetails");
            modelBuilder.Entity<Client>().ToTable("Clients");

            base.OnModelCreating(modelBuilder);
        }
    }
}
