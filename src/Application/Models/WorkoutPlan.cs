using System.ComponentModel.DataAnnotations;

namespace Application.Models
{
    public class WorkoutPlan
    {
        [Key]
        public Guid Id { get; set; }

        public Guid CoachId { get; set; } // Chi l'ha scritta
        public Guid AthleteId { get; set; } // Per chi è (UserId dell'atleta)

        public string Title { get; set; } = string.Empty; // Es. "Scheda Forza Gennaio"
        
        // --- IL CONTENUTO "WORD" ---
        public string HtmlContent { get; set; } = string.Empty; // Qui salviamo l'HTML formattato

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}