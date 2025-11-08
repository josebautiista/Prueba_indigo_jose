using Microsoft.EntityFrameworkCore;
using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using prueba_indigo_jose.Server.Infrastructure.Data;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Infrastructure.Repositories
{
    public class SaleRepository : Repository<Sale>, ISaleRepository
    {
        private readonly AppDbContext _context;

        public SaleRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Sale?> GetSaleWithDetailsAsync(int id)
        {
            return await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.SaleStatus)
                .Include(s => s.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
    }
}
