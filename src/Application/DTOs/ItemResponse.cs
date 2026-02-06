namespace Application.DTOs
{
    public class ItemResponse
    {
        // PRIMA ERA: public int Id { get; set; }
        public Guid Id { get; set; } // ORA È UUID

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        
        // PRIMA ERA: public int UserId { get; set; }
        public Guid UserId { get; set; } // ORA È UUID
    }
}