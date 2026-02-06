using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore; // Serve per Include

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IGenericRepository<Enrollment> _repository;
        private readonly IGenericRepository<Course> _courseRepo;

        public EnrollmentsController(IGenericRepository<Enrollment> repository, IGenericRepository<Course> courseRepo)
        {
            _repository = repository;
            _courseRepo = courseRepo;
        }

        // POST: api/Enrollments/join/{courseId} (MI ISCRIVO AL CORSO)
        [HttpPost("join/{courseId}")]
        public async Task<IActionResult> JoinCourse(Guid courseId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // 1. Controllo se il corso esiste
            var course = await _courseRepo.GetByIdAsync(courseId);
            if (course == null) return NotFound("Corso non trovato.");

            // 2. Controllo se sono già iscritto (per non duplicare)
            var existing = (await _repository.GetAllAsync())
                           .FirstOrDefault(e => e.CourseId == courseId && e.UserId == userId);
            
            if (existing != null) return BadRequest("Sei già iscritto a questo corso.");

            // 3. Creo l'iscrizione
            var enrollment = new Enrollment
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                UserId = userId,
                EnrollmentDate = DateTime.UtcNow
            };

            await _repository.AddAsync(enrollment);
            return Ok(new { message = "Iscrizione avvenuta con successo!" });
        }

        // GET: api/Enrollments/my-enrollments (VEDO I MIEI CORSI)
        [HttpGet("my-enrollments")]
        public async Task<IActionResult> GetMyEnrollments()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Nota: Qui servirebbe una query più efficiente con EntityFramework diretto,
            // ma con il Repository Generico facciamo un filtro in memoria per ora.
            var allEnrollments = await _repository.GetAllAsync();
            
            // Per restituire i dati belli, dovremmo fare una Join con i Corsi.
            // Per ora restituiamo gli ID. Nel prossimo step miglioreremo il Repository.
            var myEnrollments = allEnrollments.Where(e => e.UserId == userId).ToList();

            return Ok(myEnrollments);
        }
    }
}