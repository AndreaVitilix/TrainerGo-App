namespace Application.DTOs
{
    public class CreateCourseRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Instructor { get; set; } = string.Empty;
        public decimal PriceMonthly { get; set; }
        public string PriceType { get; set; } = "Mensile"; // <--- AGGIUNTO
        public string Schedule { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}