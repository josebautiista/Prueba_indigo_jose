using Microsoft.AspNetCore.Mvc;
using prueba_indigo_jose.Server.Application.Services;
using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Http;

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
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResultDto<SaleResponseDto>>> Get(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? clientIdentification = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int? statusId = null)
        {
            var result = await _service.GetPagedAsync(page, pageSize, clientIdentification, from, to, statusId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SaleResponseDto>> Get(int id)
        {
            var sale = await _service.GetDtoByIdAsync(id);
            if (sale == null) return NotFound();
            return Ok(sale);
        }

        [HttpPost]
        public async Task<ActionResult<SaleResponseDto>> Post(CreateSaleDto dto)
        {
            var sale = new Sale
            {
                Date = dto.Date,
                ClientIdentification = dto.ClientIdentification,
                TotalValue = dto.Value,
                TotalItems = dto.Quantity,
                SaleStatusId = dto.SaleStatusId,
            };

            if (dto.Items != null)
            {
                foreach (var it in dto.Items)
                {
                    sale.SaleDetails.Add(new SaleDetail
                    {
                        ProductId = it.ProductId,
                        Quantity = it.Quantity,
                        UnitPrice = it.UnitPrice
                    });
                }
            }

            await _service.AddAsync(sale);

            var created = await _service.GetDtoByIdAsync(sale.Id);
            return CreatedAtAction(nameof(Get), new { id = sale.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, Sale sale)
        {
            if (id != sale.Id)
                return BadRequest("ID mismatch.");

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
