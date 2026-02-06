using System.ComponentModel.DataAnnotations;

namespace Application.Models
{
    public class Course
    {
        [Key]
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;
        
        // Manteniamo il nome per visualizzazione veloce
        public string Instructor { get; set; } = string.Empty; 

        // --- NUOVO CAMPO FONDAMENTALE ---
        // Questo collega il corso all'ID dell'utente che l'ha creato
        public Guid CoachId { get; set; } 
        // --------------------------------

        public string Schedule { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal PriceMonthly { get; set; }
        public string PriceType { get; set; } = "Mensile";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}