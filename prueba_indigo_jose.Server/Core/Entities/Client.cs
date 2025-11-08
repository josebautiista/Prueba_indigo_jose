using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace prueba_indigo_jose.Server.Core.Entities
{
    public class Client
    {
        [Key]
        [Required]
        public string Identification { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        public List<Sale> Sales { get; set; } = new();
    }
}
