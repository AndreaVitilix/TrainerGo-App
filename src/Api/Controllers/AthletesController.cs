using Application.Interfaces;
using Application.Models;
using Application.DTOs; // Per EmailDto
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
    public class AthletesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AthletesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. COACH: AGGIUNGI ATLETA
        [HttpPost("add-by-email")]
        public async Task<IActionResult> AddAthleteByEmail([FromBody] EmailDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var coachId = Guid.Parse(userIdClaim.Value);
            
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return NotFound("Utente non trovato.");

            var exists = await _context.AthleteProfiles.AnyAsync(p => p.CoachId == coachId && p.UserId == user.Id);
            if (exists) return BadRequest("Segui già questo atleta.");

            var profile = new AthleteProfile
            {
                Id = Guid.NewGuid(),
                CoachId = coachId,
                UserId = user.Id,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AthleteProfiles.Add(profile);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Atleta aggiunto alla tua lista!" });
        }

        // 2. COACH: LISTA I MIEI ATLETI
        [HttpGet("my-athletes")]
        public async Task<IActionResult> GetMyAthletes()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var coachId = Guid.Parse(userIdClaim.Value);

            var athletes = await _context.AthleteProfiles
                .Include(p => p.User)
                .Where(p => p.CoachId == coachId)
                .Select(p => new {
                    ProfileId = p.Id,
                    UserId = p.User.Id,
                    FullName = p.User.Nome + " " + p.User.Cognome,
                    Email = p.User.Email,
                    Goal = p.Goals
                })
                .ToListAsync();

            return Ok(athletes);
        }

        // 3. GET PROFILO COMPLETO
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(Guid userId)
        {
            var profile = await _context.AthleteProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null) return NotFound("Profilo non ancora creato.");

            return Ok(profile);
        }

        // 4. AGGIORNA SCHEDA TECNICA (Utilizza il DTO per evitare conflitti con l'oggetto User)
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            var existing = await _context.AthleteProfiles.FindAsync(dto.Id);
            if (existing == null) return NotFound("Profilo non trovato.");

            // Aggiorna dati comuni
            existing.Weight = dto.Weight;
            existing.Height = dto.Height;
            existing.Goals = dto.Goals;
            existing.Equipment = dto.Equipment;
            existing.WeeklyWorkouts = dto.WeeklyWorkouts;
            existing.UpdatedAt = DateTime.UtcNow;

            // Solo il COACH può modificare le note private
            if (role == "Coach") 
            {
                existing.CoachNotes = dto.CoachNotes;
            }

            await _context.SaveChangesAsync();
            return Ok(existing);
        }
    }

    // --- DTO DEFINITI FUORI DALLA CLASSE CONTROLLER PER EVITARE ERRORI DI SINTASSI ---

    public class UpdateProfileDto 
    {
        public Guid Id { get; set; }
        public float Weight { get; set; }
        public float Height { get; set; }
        public string Goals { get; set; } = string.Empty;
        public string Equipment { get; set; } = string.Empty;
        public int WeeklyWorkouts { get; set; }
        public string CoachNotes { get; set; } = string.Empty;
    }
}