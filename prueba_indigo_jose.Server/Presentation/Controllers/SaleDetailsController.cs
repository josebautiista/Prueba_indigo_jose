using Microsoft.AspNetCore.Mvc;
using prueba_indigo_jose.Server.Application.Services;
using prueba_indigo_jose.Server.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace prueba_indigo_jose.Server.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SaleDetailsController : ControllerBase
    {
        private readonly SaleDetailService _service;

        public SaleDetailsController(SaleDetailService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleDetail>>> Get()
        {
            var details = await _service.GetAllAsync();
            return Ok(details);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SaleDetail>> Get(int id)
        {
            var detail = await _service.GetByIdAsync(id);
            if (detail == null) return NotFound();
            return Ok(detail);
        }

        [HttpPost]
        public async Task<ActionResult> Post(SaleDetail detail)
        {
            await _service.AddAsync(detail);
            return CreatedAtAction(nameof(Get), new { id = detail.Id }, detail);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, SaleDetail detail)
        {
            if (id != detail.Id)
                return BadRequest("ID mismatch.");

            await _service.UpdateAsync(detail);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var detail = await _service.GetByIdAsync(id);
            if (detail == null) return NotFound();

            await _service.DeleteAsync(detail);
            return NoContent();
        }
    }
}
