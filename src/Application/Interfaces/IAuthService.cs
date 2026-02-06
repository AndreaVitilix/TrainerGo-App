using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<string> LoginAsync(LoginRequest request);
        
        // Aggiungiamo 'roleId' per decidere chi stiamo registrando
        Task<string> RegisterAsync(RegisterRequest request, int roleId); 
    }
}