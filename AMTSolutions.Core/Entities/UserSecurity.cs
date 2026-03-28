namespace AMTSolutions.Core.Entities;

/// <summary>
/// Stores 2FA status and delivery email per user (source of truth for Settings and login).
/// </summary>
public class UserSecurity
{
    public string UserId { get; set; } = string.Empty;
    public bool TwoFactorEnabled { get; set; }
    /// <summary>Email where 2FA codes are sent (e.g. personal Gmail). If null, use account email.</summary>
    public string? TwoFactorEmail { get; set; }
}
