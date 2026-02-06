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
        // METODO 1: GET SCHEDE ATLETA SPECIFICO (Solo Coach)
        // Usato dal coach per vedere lo storico schede di un atleta che segue
        // ==========================================
        [HttpGet("athlete/{athleteUserId}")]
        public async Task<IActionResult> GetPlans(Guid athleteUserId)
        {
            var plans = await _context.WorkoutPlans
                .Where(w => w.AthleteId == athleteUserId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
            return Ok(plans);
        }

        // ==========================================
        // METODO 2: LE MIE SCHEDE (Nuovo! Solo Atleta)
        // Permette all'utente loggato di vedere tutti i suoi allenamenti
        // ==========================================
        [HttpGet("my-plans")]
        public async Task<IActionResult> GetMyPlans()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var plans = await _context.WorkoutPlans
                .Where(w => w.AthleteId == userId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();

            return Ok(plans);
        }

        // ==========================================
        // METODO 3: CREA NUOVA SCHEDA (Solo Coach)
        // Salva una nuova scheda formattata in HTML per un atleta
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreatePlan(WorkoutPlan plan)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var coachId = Guid.Parse(userIdClaim.Value);
            
            plan.Id = Guid.NewGuid();
            plan.CoachId = coachId;
            plan.CreatedAt = DateTime.UtcNow;

            _context.WorkoutPlans.Add(plan);
            await _context.SaveChangesAsync();
            return Ok(plan);
        }

        // ==========================================
        // METODO 4: ELIMINA SCHEDA (Solo Coach)
        // Rimuove una scheda di allenamento definitiva
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(Guid id)
        {
            var plan = await _context.WorkoutPlans.FindAsync(id);
            if (plan == null) return NotFound();
            
            _context.WorkoutPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}