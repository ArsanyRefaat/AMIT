namespace AMTSolutions.Core.Entities;

public class Project : BaseEntity
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Budget { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal ProgressPercent { get; set; }
    public DateTime? StartDateUtc { get; set; }
    public DateTime? EndDateUtc { get; set; }

    /// <summary>When true, this project may appear on the public website portfolio (Work).</summary>
    public bool ShowOnPublicWebsite { get; set; }

    /// <summary>Optional label on the public site (e.g. Branding, Web Design). Max length enforced in API.</summary>
    public string? WebsiteCategory { get; set; }

    /// <summary>HTTPS URL for the image on the public portfolio / case study (host the file on your site or CDN).</summary>
    public string? PublicPortfolioImageUrl { get; set; }

    /// <summary>Public case study: &quot;The Challenge&quot; section.</summary>
    public string? PublicPortfolioChallenge { get; set; }

    /// <summary>Public case study: &quot;Our Solution&quot; section.</summary>
    public string? PublicPortfolioSolution { get; set; }
}

