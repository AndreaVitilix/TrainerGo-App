public class AthleteMeasurement
{
    public Guid Id { get; set; }
    public Guid AthleteId { get; set; } // Collegamento all'utente (Atleta)
    public DateTime Date { get; set; }
    public decimal Weight { get; set; }
    public decimal? BodyFatPercentage { get; set; }
    public string? Notes { get; set; }
}