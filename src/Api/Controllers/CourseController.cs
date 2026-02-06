using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // <--- Serve il Token per entrare qui
    public class CoursesController : ControllerBase
    {
        private readonly IGenericRepository<Course> _repository;

        public CoursesController(IGenericRepository<Course> repository)
        {
            _repository = repository;
        }

        // GET: api/Courses (RESTITUISCE SOLO I CORSI DEL COACH LOGGATO)
        [HttpGet]
        public async Task<IActionResult> GetMyCourses()
        {
            // 1. Recuperiamo l'ID dell'utente dal Token
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = Guid.Parse(userIdString);

            // 2. Recuperiamo TUTTI i corsi
            var allCourses = await _repository.GetAllAsync();

            // 3. FILTRIAMO: Teniamo solo quelli creati da QUESTO utente
            // (Nota: in un sistema più grande il filtro si farebbe nel DB, ma per ora va bene qui)
            var myCourses = allCourses.Where(c => c.CoachId == userId).ToList();

            return Ok(myCourses);
        }

        // POST: api/Courses (CREA ASSEGNANDO AUTOMATICAMENTE L'AUTORE)
        [HttpPost]
        public async Task<IActionResult> Create(Course course)
        {
            // 1. Chi sta creando il corso?
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            
            // 2. Assegniamo l'ID automaticamente
            course.CoachId = Guid.Parse(userIdString); 
            course.Id = Guid.NewGuid();
            course.CreatedAt = DateTime.UtcNow;

            // (Opzionale) Se l'Instructor name è vuoto, potremmo volerlo recuperare dal DB User, 
            // ma per ora fidiamoci di quello che manda il frontend o lasciamolo come stringa.

            await _repository.AddAsync(course);
            return Ok(course);
        }

        // DELETE: api/Courses/{id} (CANCELLA SOLO SE È TUO)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = Guid.Parse(userIdString!);

            var course = await _repository.GetByIdAsync(id);
            if (course == null) return NotFound();

            // SICUREZZA: Non puoi cancellare il corso di un altro!
            if (course.CoachId != userId) 
            {
                return StatusCode(403, "Non puoi cancellare un corso che non è tuo.");
            }

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Corso eliminato" });
        }

        // PUT: api/Courses (AGGIORNA SOLO SE È TUO)
        [HttpPut]
        public async Task<IActionResult> Update(Course course)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = Guid.Parse(userIdString!);

            var existingCourse = await _repository.GetByIdAsync(course.Id);
            if (existingCourse == null) return NotFound();

            // SICUREZZA
            if (existingCourse.CoachId != userId)
            {
                return StatusCode(403, "Non puoi modificare un corso che non è tuo.");
            }

            // Manteniamo l'ID del proprietario originale per sicurezza
            course.CoachId = userId; 
            
            await _repository.UpdateAsync(course);
            return Ok(course);
        }
    }
}