using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Application.Services
{
    public class SaleStatusService
    {
        private readonly ISaleStatusRepository _repository;

        public SaleStatusService(ISaleStatusRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SaleStatus>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<SaleStatus?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

        public async Task AddAsync(SaleStatus status)
        {
            await _repository.AddAsync(status);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(SaleStatus status)
        {
            _repository.Update(status);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(SaleStatus status)
        {
            _repository.Delete(status);
            await _repository.SaveChangesAsync();
        }
    }
}
