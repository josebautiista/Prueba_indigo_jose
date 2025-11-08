using prueba_indigo_jose.Server.Core.Entities;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Core.Interfaces
{
    public interface ISaleRepository : IRepository<Sale>
    {
        Task<Sale?> GetSaleWithDetailsAsync(int id);
    }
}
