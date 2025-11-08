using Microsoft.EntityFrameworkCore;
using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using prueba_indigo_jose.Server.Infrastructure.Data;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Infrastructure.Repositories
{
    public class SaleRepository : Repository<Sale>, ISaleRepository
    {
        public SaleRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Sale>> GetAllWithDetailsAsync()
        {
            return await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.SaleStatus)
                .Include(s => s.SaleDetails)
                    .ThenInclude(d => d.Product)
                .ToListAsync();
        }

        public async Task<Sale?> GetSaleWithDetailsAsync(int id)
        {
            return await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.SaleStatus)
                .Include(s => s.SaleDetails)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<prueba_indigo_jose.Server.Core.DTO.PagedResultDto<Sale>> GetPagedWithDetailsAsync(int page, int pageSize, string? clientIdentification, System.DateTime? from, System.DateTime? to, int? statusId)
        {
            var query = _context.Sales.AsQueryable();

            if (!string.IsNullOrWhiteSpace(clientIdentification))
                query = query.Where(s => s.ClientIdentification == clientIdentification);

            if (from.HasValue)
                query = query.Where(s => s.Date >= from.Value);

            if (to.HasValue)
                query = query.Where(s => s.Date <= to.Value);

            if (statusId.HasValue && statusId.Value > 0)
                query = query.Where(s => s.SaleStatusId == statusId.Value);

            var total = await query.CountAsync();

            var items = await query
                .Include(s => s.Client)
                .Include(s => s.SaleStatus)
                .Include(s => s.SaleDetails)
                    .ThenInclude(d => d.Product)
                .OrderByDescending(s => s.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new prueba_indigo_jose.Server.Core.DTO.PagedResultDto<Sale>
            {
                Items = items,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
