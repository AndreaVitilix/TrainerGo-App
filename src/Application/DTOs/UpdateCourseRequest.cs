namespace Application.DTOs
{
    public class UpdateCourseRequest
    {
        public Guid Id { get; set; } // Fondamentale per sapere chi modificare
        public string Name { get; set; } = string.Empty;
        public string Instructor { get; set; } = string.Empty;
        public decimal PriceMonthly { get; set; }
        public string PriceType { get; set; } = "Mensile";
        public string Schedule { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}