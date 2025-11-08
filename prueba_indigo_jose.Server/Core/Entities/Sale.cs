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
        public Client? Client { get; set; }

        public decimal TotalValue { get; set; }
        public int TotalItems { get; set; }

        public int SaleStatusId { get; set; }

        public SaleStatus? SaleStatus { get; set; }

        public ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>();
    }
}
