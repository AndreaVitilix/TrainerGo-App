using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Infrastructure.Data;

namespace Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> LoginAsync(LoginRequest request)
        {
            // Carica utente e ruolo per il Token
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash)) return null!;
            
            return GenerateJwtToken(user);
        }

        public async Task<string> RegisterAsync(RegisterRequest request, int roleId)
        {
            // Controllo mail duplicata
            if (await _context.Users.AnyAsync(u => u.Email == request.Email)) 
                throw new Exception("Email già presente.");

            // Controllo esistenza ruolo (Sicurezza)
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null) throw new Exception("Ruolo non valido o non esistente.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                Nome = request.Nome,
                Cognome = request.Cognome,
                CodiceFiscale = request.CodiceFiscale,
                Telefono = request.Telefono,
                RoleId = roleId, // <--- ASSEGNAZIONE DINAMICA (2 o 3)
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assegna il ruolo all'oggetto user per generare subito il token corretto
            user.Role = role;

            return GenerateJwtToken(user);
        }

        // --- Helpers Sicurezza ---
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
                return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
        }

        private bool VerifyPassword(string input, string hash) => HashPassword(input) == hash;

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                // Qui mettiamo il nome del ruolo nel token (es. "Coach")
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User") 
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}