using Microsoft.AspNetCore.Mvc;
using prueba_indigo_jose.Server.Application.Services;
using prueba_indigo_jose.Server.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly SaleService _service;

        public SalesController(SaleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sale>>> Get()
        {
            var sales = await _service.GetAllAsync();
            return Ok(sales);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sale>> Get(int id)
        {
            var sale = await _service.GetByIdAsync(id);
            if (sale == null) return NotFound();
            return Ok(sale);
        }

        [HttpPost]
        public async Task<ActionResult> Post(Sale sale)
        {
            await _service.AddAsync(sale);
            return CreatedAtAction(nameof(Get), new { id = sale.Id }, sale);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, Sale sale)
        {
            if (id != sale.Id)
                return BadRequest("El ID de la venta no coincide.");

            await _service.UpdateAsync(sale);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var sale = await _service.GetByIdAsync(id);
            if (sale == null) return NotFound();

            await _service.DeleteAsync(sale);
            return NoContent();
        }
    }
}
