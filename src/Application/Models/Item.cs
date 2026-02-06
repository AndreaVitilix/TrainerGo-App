using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Application.Models
{
    public class Item
    {
        [Key]
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;


        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; } // Mettiamo nullable per sicurezza
    }
}