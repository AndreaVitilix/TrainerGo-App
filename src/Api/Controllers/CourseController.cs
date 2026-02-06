using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly IGenericRepository<Course> _repository;

        public CoursesController(IGenericRepository<Course> repository)
        {
            _repository = repository;
        }

        // GET: api/Courses
        // Logica: Il Coach vede i suoi, l'User vede TUTTO.
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // 1. Chi sei?
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "User"; // Leggiamo il Ruolo dal Token

            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = Guid.Parse(userIdString);

            // 2. Prendiamo tutti i corsi
            var allCourses = await _repository.GetAllAsync();

            // 3. LOGICA DI FILTRO
            if (userRole == "Coach")
            {
                // SEI UN COACH: Vedi solo quelli che hai creato tu
                var myCourses = allCourses.Where(c => c.CoachId == userId).ToList();
                return Ok(myCourses);
            }
            else
            {
                // SEI UN UTENTE (ATLETA): Vedi TUTTI i corsi disponibili per iscriverti
                return Ok(allCourses);
            }
        }

        // POST: api/Courses (Solo Coach)
        [HttpPost]
        public async Task<IActionResult> Create(Course course)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            
            course.CoachId = Guid.Parse(userIdString); // Assegna il creatore
            course.Id = Guid.NewGuid();
            course.CreatedAt = DateTime.UtcNow;

            await _repository.AddAsync(course);
            return Ok(course);
        }

        // DELETE: api/Courses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = Guid.Parse(userIdString);

            var course = await _repository.GetByIdAsync(id);
            if (course == null) return NotFound();

            // Solo il Coach proprietario o un Admin può cancellare
            if (userRole != "Admin" && course.CoachId != userId) 
            {
                return StatusCode(403, "Non puoi cancellare un corso che non è tuo.");
            }

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Corso eliminato" });
        }

        // PUT: api/Courses
        [HttpPut]
        public async Task<IActionResult> Update(Course course)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = Guid.Parse(userIdString!);

            var existingCourse = await _repository.GetByIdAsync(course.Id);
            if (existingCourse == null) return NotFound();

            if (existingCourse.CoachId != userId)
            {
                return StatusCode(403, "Non puoi modificare un corso che non è tuo.");
            }

            // Manteniamo l'ID proprietario originale
            course.CoachId = existingCourse.CoachId; 
            
            await _repository.UpdateAsync(course);
            return Ok(course);
        }
    }
}