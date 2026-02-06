using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Application.Models
{
    public class AthleteProfile
    {
        [Key]
        public Guid Id { get; set; }

        // Il Coach che segue l'atleta
        public Guid CoachId { get; set; }

        // L'Atleta (Utente)
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // --- DATI CONDIVISI (Compilati dall'atleta o dal coach) ---
        public float Weight { get; set; } // Peso (kg)
        public float Height { get; set; } // Altezza (cm)
        public string Goals { get; set; } = string.Empty; // Obiettivi (es. Ipertrofia)
        public string Equipment { get; set; } = string.Empty; // Attrezzatura (es. Manubri, Panca)
        public int WeeklyWorkouts { get; set; } // Quante volte vuole allenarsi

        // --- DATI PRIVATI (Solo per il Coach) ---
        public string CoachNotes { get; set; } = string.Empty; // Note invisibili all'atleta o sola lettura

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}