using Application.Models;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WorkoutPlansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkoutPlansController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // METODO 1: GET SCHEDE PER IL COACH
        // Recupera i piani di un atleta specifico tramite il suo UserId
        // ==========================================
        [HttpGet("athlete/{athleteUserId}")]
        public async Task<IActionResult> GetPlans(Guid athleteUserId)
        {
            // Filtra rigorosamente per l'ID dell'atleta richiesto
            var plans = await _context.WorkoutPlans
                .Where(w => w.AthleteId == athleteUserId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();

            return Ok(plans);
        }

        // ==========================================
        // METODO 2: GET LE MIE SCHEDE (Per l'Atleta)
        // Recupera i piani dell'atleta loggato usando l'ID dal Token
        // ==========================================
        [HttpGet("my-plans")]
        public async Task<IActionResult> GetMyPlans()
        {
            // Prende l'ID dell'utente dal Token (sicuro al 100%)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = Guid.Parse(userIdClaim.Value);
            
            var plans = await _context.WorkoutPlans
                .Where(w => w.AthleteId == userId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();

            return Ok(plans);
        }

        // ==========================================
        // METODO 3: CREA NUOVA SCHEDA (Solo Coach)
        // Crea una scheda e la associa correttamente all'atleta indicato
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreatePlan([FromBody] WorkoutPlan plan)
        {
            // 1. Identifichiamo il Coach dal Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            var coachId = Guid.Parse(userIdClaim.Value);

            // 2. Validazione: Verifichiamo che l'AthleteId sia stato inviato dal frontend
            if (plan.AthleteId == Guid.Empty)
            {
                return BadRequest("Errore: AthleteId mancante. Impossibile associare la scheda.");
            }
            
            // 3. Prepariamo l'oggetto per il salvataggio
            plan.Id = Guid.NewGuid();
            plan.CoachId = coachId; // Il coach è chi crea la scheda
            plan.CreatedAt = DateTime.UtcNow;

            // Nota: plan.AthleteId rimane quello inviato nel body JSON dal frontend
            // Questo assicura la distinzione tra Atleta 1 e Atleta 2

            _context.WorkoutPlans.Add(plan);
            await _context.SaveChangesAsync();
            
            return Ok(plan);
        }

        // ==========================================
        // METODO 4: ELIMINA SCHEDA (Solo Coach)
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(Guid id)
        {
            var plan = await _context.WorkoutPlans.FindAsync(id);
            if (plan == null) return NotFound();
            
            // (Opzionale) Potresti aggiungere un controllo per assicurarti 
            // che solo il coach che l'ha creata possa cancellarla
            
            _context.WorkoutPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // ==========================================
// METODO 5: AGGIORNA SCHEDA (PUT)
// Permette al coach di modificare titolo o contenuto
// ==========================================
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] WorkoutPlan updatedPlan)
{
    // 1. Identifichiamo il Coach dal Token JWT
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Unauthorized();
    var coachId = Guid.Parse(userIdClaim.Value);

    // 2. Cerchiamo la scheda originale nel DB
    var existingPlan = await _context.WorkoutPlans.FindAsync(id);
    if (existingPlan == null) return NotFound("Scheda non trovata.");

    // 3. SICUREZZA: Solo il coach che ha creato la scheda può modificarla
    if (existingPlan.CoachId != coachId)
    {
        return StatusCode(403, "Non hai i permessi per modificare questa scheda.");
    }

    // 4. Aggiorniamo solo i campi necessari
    existingPlan.Title = updatedPlan.Title;
    existingPlan.HtmlContent = updatedPlan.HtmlContent;
    // Nota: AthleteId e CoachId non vengono cambiati per mantenere l'integrità dei dati

    try
    {
        await _context.SaveChangesAsync();
        return Ok(existingPlan);
    }
    catch (Exception ex)
    {
        return BadRequest($"Errore durante l'aggiornamento: {ex.Message}");
    }
}
    }
    
}