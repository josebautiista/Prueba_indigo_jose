using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Application.Services
{
    public class ProductService
    {
        private readonly IProductRepository _repository;

        public ProductService(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Product>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<Product?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

        public async Task AddAsync(Product product)
        {
            await _repository.AddAsync(product);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Product product)
        {
            _repository.Update(product);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(Product product)
        {
            _repository.Delete(product);
            await _repository.SaveChangesAsync();
        }
    }
}
