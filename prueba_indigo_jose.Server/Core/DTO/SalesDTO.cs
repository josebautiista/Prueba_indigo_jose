namespace prueba_indigo_jose.Server.Core.DTO
{
    public class CreateSaleDto
    {
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string ClientIdentification { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public int Quantity { get; set; }
        public int SaleStatusId { get; set; }
        public List<CreateSaleDetailDto> Items { get; set; } = new();
    }

    public class SaleResponseDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string ClientIdentification { get; set; } = string.Empty;
        public ClientDto? Client { get; set; }
        public decimal Value { get; set; }
        public int Quantity { get; set; }
        public int SaleStatusId { get; set; }
        public SaleStatusDto? SaleStatus { get; set; }
        public List<SaleDetailResponseDto> Items { get; set; } = new();
    }
}
