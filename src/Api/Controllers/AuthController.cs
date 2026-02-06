using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Linq; // Serve per leggere i Claims

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // --- LOGIN (Restituisce Token + Ruolo) ---
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var token = await _authService.LoginAsync(request);
            
            if (token == null) 
                return Unauthorized(new { message = "Email o Password errati" });

            // Decodifichiamo il token per estrarre il ruolo e mandarlo al frontend
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var role = jwt.Claims.FirstOrDefault(c => c.Type == "role" || c.Type == System.Security.Claims.ClaimTypes.Role)?.Value ?? "User";

            return Ok(new { Token = token, Role = role });
        }

        // --- REGISTRAZIONE UTENTE NORMALE (ATLETA) - ID 2 ---
        [HttpPost("register/user")]
        public async Task<IActionResult> RegisterUser(RegisterRequest request)
        {
            try 
            {
                // Passiamo 2 = USER
                var token = await _authService.RegisterAsync(request, 2);
                return Ok(new { Token = token, Role = "User" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // --- REGISTRAZIONE COACH - ID 3 ---
        [HttpPost("register/coach")]
        public async Task<IActionResult> RegisterCoach(RegisterRequest request)
        {
            try 
            {
                // Passiamo 3 = COACH
                var token = await _authService.RegisterAsync(request, 3);
                return Ok(new { Token = token, Role = "Coach" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}