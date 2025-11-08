using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Application.Services
{
    public class SaleDetailService
    {
        private readonly ISaleDetailRepository _repository;

        public SaleDetailService(ISaleDetailRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SaleDetail>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<SaleDetail?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

        public async Task AddAsync(SaleDetail detail)
        {
            await _repository.AddAsync(detail);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(SaleDetail detail)
        {
            _repository.Update(detail);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(SaleDetail detail)
        {
            _repository.Delete(detail);
            await _repository.SaveChangesAsync();
        }
    }
}
