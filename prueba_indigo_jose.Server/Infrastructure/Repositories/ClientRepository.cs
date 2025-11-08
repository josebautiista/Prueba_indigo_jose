using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using prueba_indigo_jose.Server.Infrastructure.Data;

namespace prueba_indigo_jose.Server.Infrastructure.Repositories
{
    public class ClientRepository : Repository<Client>, IClientRepository
    {
        public ClientRepository(AppDbContext context) : base(context) { }
    }
}
