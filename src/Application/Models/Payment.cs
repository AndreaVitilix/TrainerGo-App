using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Application.Models
{
    public class Payment
    {
        [Key]
        public Guid Id { get; set; }

        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        
        public string Note { get; set; } = string.Empty;
        
        public bool IsConfirmed { get; set; } = true;

        // Relazione con User
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}