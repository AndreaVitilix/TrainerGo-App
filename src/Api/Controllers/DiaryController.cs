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
    public class DiaryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DiaryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // SEZIONE 1: ALLENAMENTI (Workout Logs)
        // ==========================================

        // L'atleta salva un esercizio svolto
        [HttpPost("workout")]
        public async Task<IActionResult> LogWorkout([FromBody] TrainingLog log)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            log.Id = Guid.NewGuid();
            log.AthleteId = Guid.Parse(userIdClaim.Value);
            log.Date = DateTime.UtcNow;

            _context.TrainingLogs.Add(log);
            await _context.SaveChangesAsync();
            return Ok(log);
        }

        // Recupera storico allenamenti (Sia per Coach che per Atleta)
        [HttpGet("workout/{athleteUserId}")]
        public async Task<IActionResult> GetWorkoutLogs(Guid athleteUserId)
        {
            var logs = await _context.TrainingLogs
                .Where(l => l.AthleteId == athleteUserId)
                .OrderByDescending(l => l.Date)
                .ToListAsync();

            return Ok(logs);
        }

        // ==========================================
        // SEZIONE 2: MISURE (Weight Logs)
        // ==========================================

        // L'atleta salva il suo peso o misure
        [HttpPost("measurement")]
        public async Task<IActionResult> LogMeasurement([FromBody] AthleteMeasurement measure)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            measure.Id = Guid.NewGuid();
            measure.AthleteId = Guid.Parse(userIdClaim.Value);
            measure.Date = DateTime.UtcNow;

            _context.AthleteMeasurements.Add(measure);
            await _context.SaveChangesAsync();
            return Ok(measure);
        }

        // Recupera storico peso/misure (Sia per Coach che per Atleta)
        [HttpGet("measurement/{athleteUserId}")]
        public async Task<IActionResult> GetMeasurements(Guid athleteUserId)
        {
            var measures = await _context.AthleteMeasurements
                .Where(m => m.AthleteId == athleteUserId)
                .OrderByDescending(m => m.Date)
                .ToListAsync();

            return Ok(measures);
        }
    }
}