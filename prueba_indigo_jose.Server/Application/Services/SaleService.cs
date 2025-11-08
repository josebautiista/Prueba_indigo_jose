using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using prueba_indigo_jose.Server.Core.DTO;
using System.Linq;

namespace prueba_indigo_jose.Server.Application.Services
{
    public class SaleService
    {
        private readonly ISaleRepository _repository;

        public SaleService(ISaleRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Sale>> GetAllAsync() => await _repository.GetAllWithDetailsAsync();

        public async Task<Sale?> GetByIdAsync(int id) => await _repository.GetSaleWithDetailsAsync(id);

        public async Task<PagedResultDto<SaleResponseDto>> GetPagedAsync(int page, int pageSize, string? clientIdentification, System.DateTime? from, System.DateTime? to, int? statusId)
        {
            var paged = await _repository.GetPagedWithDetailsAsync(page, pageSize, clientIdentification, from, to, statusId);
            var mapped = new PagedResultDto<SaleResponseDto>
            {
                Items = paged.Items.Select(MapToDto).ToList(),
                TotalCount = paged.TotalCount,
                Page = paged.Page,
                PageSize = paged.PageSize
            };
            return mapped;
        }

        public async Task<SaleResponseDto?> GetDtoByIdAsync(int id)
        {
            var s = await _repository.GetSaleWithDetailsAsync(id);
            return s == null ? null : MapToDto(s);
        }

        private SaleResponseDto MapToDto(Sale s)
        {
            return new SaleResponseDto
            {
                Id = s.Id,
                Date = s.Date,
                ClientIdentification = s.ClientIdentification,
                Client = s.Client == null ? null : new ClientDto
                {
                    Identification = s.Client.Identification,
                    Name = s.Client.Name,
                    Phone = s.Client.Phone,
                    Email = s.Client.Email,
                    Address = s.Client.Address
                },
                Value = s.TotalValue,
                Quantity = s.TotalItems,
                SaleStatusId = s.SaleStatusId,
                SaleStatus = s.SaleStatus == null ? null : new SaleStatusDto { Id = s.SaleStatus.Id, Name = s.SaleStatus.Name },
                Items = s.SaleDetails?.Select(d => new SaleDetailResponseDto
                {
                    Id = d.Id,
                    ProductId = d.ProductId,
                    Product = d.Product == null ? null : new ProductDto { Id = d.Product.Id, Name = d.Product.Name, Price = d.Product.Price, Stock = d.Product.Stock, Image = d.Product.Image },
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice
                }).ToList() ?? new List<SaleDetailResponseDto>()
            };
        }

        public async Task AddAsync(Sale sale)
        {
            await _repository.AddAsync(sale);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Sale sale)
        {
            _repository.Update(sale);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(Sale sale)
        {
            _repository.Delete(sale);
            await _repository.SaveChangesAsync();
        }
    }
}
