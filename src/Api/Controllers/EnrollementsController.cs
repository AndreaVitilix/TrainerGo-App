using Application.Interfaces;
using Application.Models;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Application.DTOs;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IGenericRepository<Enrollment> _repository;
        private readonly IGenericRepository<Course> _courseRepo;
        private readonly ApplicationDbContext _context;

        public EnrollmentsController(IGenericRepository<Enrollment> repository, IGenericRepository<Course> courseRepo, ApplicationDbContext context)
        {
            _repository = repository;
            _courseRepo = courseRepo;
            _context = context;
        }

        // --- ATLETA: ISCRIZIONE ---
        [HttpPost("join/{courseId}")]
        public async Task<IActionResult> JoinCourse(Guid courseId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var course = await _courseRepo.GetByIdAsync(courseId);
            if (course == null) return NotFound("Corso non trovato.");

            var existing = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);
            if (existing != null) return BadRequest("Sei già iscritto.");

            var enrollment = new Enrollment { Id = Guid.NewGuid(), CourseId = courseId, UserId = userId, EnrollmentDate = DateTime.UtcNow };
            await _repository.AddAsync(enrollment);
            return Ok(new { message = "Iscrizione avvenuta!" });
        }

        // --- ATLETA: DISISCRIZIONE (Nuovo!) ---
        [HttpDelete("leave/{courseId}")]
        public async Task<IActionResult> LeaveCourse(Guid courseId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);

            if (enrollment == null) return NotFound("Non sei iscritto a questo corso.");

            await _repository.DeleteAsync(enrollment.Id);
            return Ok(new { message = "Disiscrizione completata." });
        }

        // --- ATLETA: I MIEI CORSI ---
        [HttpGet("my-enrollments")]
        public async Task<IActionResult> GetMyEnrollments()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var myEnrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.UserId == userId)
                .Select(e => new { 
                    EnrollmentId = e.Id, 
                    CourseId = e.Course.Id, // Serve al frontend per capire a quali siamo iscritti
                    CourseName = e.Course.Name, 
                    Instructor = e.Course.Instructor, 
                    Schedule = e.Course.Schedule 
                })
                .ToListAsync();
            return Ok(myEnrollments);
        }

        // --- COACH: VEDI ISCRITTI DEL CORSO (Nuovo!) ---
        [HttpGet("course/{courseId}/students")]
        public async Task<IActionResult> GetStudents(Guid courseId)
        {
            // Controllo sicurezza: Il corso è mio?
            var coachId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var course = await _courseRepo.GetByIdAsync(courseId);
            
            if (course == null) return NotFound();
            if (course.CoachId != coachId) return StatusCode(403, "Non è il tuo corso.");

            var students = await _context.Enrollments
                .Include(e => e.User)
                .Where(e => e.CourseId == courseId)
                .Select(e => new {
                    EnrollmentId = e.Id,
                    UserId = e.User.Id,
                    FullName = e.User.Nome + " " + e.User.Cognome,
                    Email = e.User.Email,
                    Date = e.EnrollmentDate
                })
                .ToListAsync();

            return Ok(students);
        }

        // --- COACH: ISCRIVI UTENTE MANUALMENTE (Nuovo!) ---
        [HttpPost("course/{courseId}/enroll-student")]
        public async Task<IActionResult> EnrollStudentManually(Guid courseId, [FromBody] EmailDto request)
        {
            var coachId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var course = await _courseRepo.GetByIdAsync(courseId);
            
            if (course == null) return NotFound();
            if (course.CoachId != coachId) return StatusCode(403, "Non è il tuo corso.");

            // Trova utente per email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return NotFound("Utente non trovato con questa email.");

            // Controlla duplicati
            var exists = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == user.Id);
            if (exists) return BadRequest("L'utente è già iscritto.");

            var enrollment = new Enrollment { Id = Guid.NewGuid(), CourseId = courseId, UserId = user.Id, EnrollmentDate = DateTime.UtcNow };
            await _repository.AddAsync(enrollment);

            return Ok(new { message = "Utente aggiunto al corso!" });
        }
    }

    // DTO veloce per passare l'email

}