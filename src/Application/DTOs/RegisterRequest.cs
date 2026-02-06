namespace Application.DTOs
{
    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Cognome { get; set; } = string.Empty;
        public string CodiceFiscale { get; set; } = string.Empty;
        
        //telefono
        public string Telefono { get; set; } = string.Empty;
    }
}