namespace prueba_indigo_jose.Server.Core.Entities
{
    public class SaleDetail
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public Sale? Sale { get; set; }

        public int ProductId { get; set; } = 0;
        public Product? Product { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
