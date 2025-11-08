using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Application.Services
{
    public class SaleService
    {
        private readonly ISaleRepository _repository;

        public SaleService(ISaleRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Sale>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<Sale?> GetByIdAsync(int id) => await _repository.GetSaleWithDetailsAsync(id);

        public async Task AddAsync(Sale sale)
        {
            await _repository.AddAsync(sale);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Sale sale)
        {
            _repository.Update(sale);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(Sale sale)
        {
            _repository.Delete(sale);
            await _repository.SaveChangesAsync();
        }
    }
}
