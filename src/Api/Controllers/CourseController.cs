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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";

            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = Guid.Parse(userIdString);

            var allCourses = await _repository.GetAllAsync();

            if (userRole == "Coach")
            {
                var myCourses = allCourses.Where(c => c.CoachId == userId).ToList();
                return Ok(myCourses);
            }
            
            return Ok(allCourses);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Course course)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            
            course.CoachId = Guid.Parse(userIdString);
            course.Id = Guid.NewGuid();
            course.CreatedAt = DateTime.UtcNow;

            await _repository.AddAsync(course);
            return Ok(course);
        }

        // ==========================================
        // PUT: api/Courses/{id}
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CourseUpdateDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = Guid.Parse(userIdString);

            var existingCourse = await _repository.GetByIdAsync(id);
            if (existingCourse == null) return NotFound("Corso non trovato.");

            if (existingCourse.CoachId != userId)
            {
                return StatusCode(403, "Non puoi modificare un corso che non hai creato tu.");
            }

            // MAPPATURA CAMPI
            existingCourse.Name = dto.Name;
            existingCourse.Instructor = dto.Instructor;
            existingCourse.PriceMonthly = dto.PriceMonthly; // Ora i tipi coincidono (decimal)
            existingCourse.Schedule = dto.Schedule;
            existingCourse.Description = dto.Description;

            await _repository.UpdateAsync(existingCourse);
            return Ok(existingCourse);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = Guid.Parse(userIdString);

            var course = await _repository.GetByIdAsync(id);
            if (course == null) return NotFound();

            if (userRole != "Admin" && course.CoachId != userId)
            {
                return StatusCode(403, "Operazione non consentita.");
            }

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Corso eliminato" });
        }
    }

    // --- DTO CORRETTO CON DECIMAL ---
    public class CourseUpdateDto 
    {
        public string Name { get; set; } = string.Empty;
        public string Instructor { get; set; } = string.Empty;
        public decimal PriceMonthly { get; set; } // <--- CAMBIATO DA float A decimal
        public string Schedule { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}