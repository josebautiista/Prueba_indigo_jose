using prueba_indigo_jose.Server.Core.Entities;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Core.Interfaces
{
    public interface ISaleRepository : IRepository<Sale>
    {
        Task<Sale?> GetSaleWithDetailsAsync(int id);
        Task<IEnumerable<Sale>> GetAllWithDetailsAsync();
        Task<prueba_indigo_jose.Server.Core.DTO.PagedResultDto<Sale>> GetPagedWithDetailsAsync(int page, int pageSize, string? clientIdentification, System.DateTime? from, System.DateTime? to, int? statusId);
    }
}