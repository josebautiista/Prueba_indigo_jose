using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using prueba_indigo_jose.Server.Infrastructure.Data;

namespace prueba_indigo_jose.Server.Infrastructure.Repositories
{
    public class SaleStatusRepository : Repository<SaleStatus>, ISaleStatusRepository
    {
        public SaleStatusRepository(AppDbContext context) : base(context) { }
    }
}
