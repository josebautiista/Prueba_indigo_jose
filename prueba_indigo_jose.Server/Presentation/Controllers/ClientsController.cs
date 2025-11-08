using Microsoft.AspNetCore.Mvc;
using prueba_indigo_jose.Server.Application.Services;
using prueba_indigo_jose.Server.Core.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace prueba_indigo_jose.Server.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly ClientService _service;

        public ClientsController(ClientService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Client>>> Get() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Client>> Get(string id)
        {
            var client = await _service.GetByIdAsync(id);
            if (client == null) return NotFound();
            return Ok(client);
        }

        [HttpPost]
        public async Task<ActionResult> Post(Client client)
        {
            await _service.AddAsync(client);
            return CreatedAtAction(nameof(Get), new { id = client.Identification }, client);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(string id, Client client)
        {
            if (id != client.Identification) return BadRequest();
            await _service.UpdateAsync(client);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var client = await _service.GetByIdAsync(id);
            if (client == null) return NotFound();
            await _service.DeleteAsync(client);
            return NoContent();
        }
    }
}
