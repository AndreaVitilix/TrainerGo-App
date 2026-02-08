public class TrainingLog
{
    public Guid Id { get; set; }
    public Guid AthleteId { get; set; }
    public DateTime Date { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public decimal WeightLifted { get; set; } // Il carico usato
    public string? EffortLevel { get; set; } // Es: RPE o sensazioni
}