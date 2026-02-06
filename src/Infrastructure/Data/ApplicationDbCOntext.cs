using Application.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Payment> Payments { get; set; } // Se hai ancora il modello Payment
        public DbSet<Item> Items { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<AthleteProfile> AthleteProfiles { get; set; }
        public DbSet<WorkoutPlan> WorkoutPlans { get; set; }
    }
}