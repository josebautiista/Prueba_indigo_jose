using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Application.Services
{
    public class ClientService
    {
        private readonly IClientRepository _repository;

        public ClientService(IClientRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Client>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<Client?> GetByIdAsync(string id) => await _repository.GetByIdAsync(id);

        public async Task AddAsync(Client client)
        {
            await _repository.AddAsync(client);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Client client)
        {
            _repository.Update(client);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(Client client)
        {
            _repository.Delete(client);
            await _repository.SaveChangesAsync();
        }
    }
}
