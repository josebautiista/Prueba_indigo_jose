using Microsoft.AspNetCore.Mvc;
using prueba_indigo_jose.Server.Application.Services;
using prueba_indigo_jose.Server.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SaleStatusController : ControllerBase
    {
        private readonly SaleStatusService _service;

        public SaleStatusController(SaleStatusService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleStatus>>> Get()
        {
            var statuses = await _service.GetAllAsync();
            return Ok(statuses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SaleStatus>> Get(int id)
        {
            var status = await _service.GetByIdAsync(id);
            if (status == null) return NotFound();
            return Ok(status);
        }

        [HttpPost]
        public async Task<ActionResult> Post(SaleStatus status)
        {
            await _service.AddAsync(status);
            return CreatedAtAction(nameof(Get), new { id = status.Id }, status);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, SaleStatus status)
        {
            if (id != status.Id)
                return BadRequest("ID mismatch.");

            await _service.UpdateAsync(status);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var status = await _service.GetByIdAsync(id);
            if (status == null) return NotFound();

            await _service.DeleteAsync(status);
            return NoContent();
        }
    }
}
