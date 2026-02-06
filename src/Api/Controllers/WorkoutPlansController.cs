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

        // GET: Schede di un atleta specifico
        [HttpGet("athlete/{athleteUserId}")]
        public async Task<IActionResult> GetPlans(Guid athleteUserId)
        {
            var plans = await _context.WorkoutPlans
                .Where(w => w.AthleteId == athleteUserId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
            return Ok(plans);
        }

        // POST: Crea nuova scheda (Solo Coach)
        [HttpPost]
        public async Task<IActionResult> CreatePlan(WorkoutPlan plan)
        {
            var coachId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            plan.Id = Guid.NewGuid();
            plan.CoachId = coachId;
            plan.CreatedAt = DateTime.UtcNow;

            _context.WorkoutPlans.Add(plan);
            await _context.SaveChangesAsync();
            return Ok(plan);
        }

        // DELETE
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