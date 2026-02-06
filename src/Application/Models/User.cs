using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Application.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        public string Nome { get; set; } = string.Empty;
        public string Cognome { get; set; } = string.Empty;
        public string CodiceFiscale { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        
        // SICUREZZA: Qui finisce l'hash, non la password vera
        public string PasswordHash { get; set; } = string.Empty;
        
        public string? Telefono { get; set; } 

        // RELAZIONE CON I RUOLI (Foreign Key)
        public int RoleId { get; set; } 
        
        [ForeignKey("RoleId")]
        public Role Role { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}