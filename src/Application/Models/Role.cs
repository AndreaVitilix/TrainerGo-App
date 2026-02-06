using System.ComponentModel.DataAnnotations;

namespace Application.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; } // 1, 2...
        public string Name { get; set; } = string.Empty; // "Admin", "User"
    }
}