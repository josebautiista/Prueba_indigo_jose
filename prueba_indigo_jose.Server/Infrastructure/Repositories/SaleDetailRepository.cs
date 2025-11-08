using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using prueba_indigo_jose.Server.Infrastructure.Data;

namespace prueba_indigo_jose.Server.Infrastructure.Repositories
{
    public class SaleDetailRepository : Repository<SaleDetail>, ISaleDetailRepository
    {
        private readonly AppDbContext _context;

        public SaleDetailRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
