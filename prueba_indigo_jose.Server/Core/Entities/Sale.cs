using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace prueba_indigo_jose.Server.Core.Entities
{
    public class Sale
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string ClientIdentification { get; set; } = string.Empty;

        [ForeignKey(nameof(ClientIdentification))]
        public Client? Client { get; set; }

        public decimal Value { get; set; }
        public int Quantity { get; set; }

        public int SaleStatusId { get; set; }
        public SaleStatus? SaleStatus { get; set; }

        public List<SaleDetail> Items { get; set; } = new();
    }
}
