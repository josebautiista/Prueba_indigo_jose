using System.ComponentModel.DataAnnotations;

namespace prueba_indigo_jose.Server.Core.Entities
{
    public class Product
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public decimal Price { get; set; }
        public int Stock { get; set; } = 0;
        public string? Image { get; set; }
    }
}
