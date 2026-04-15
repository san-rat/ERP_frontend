namespace ERP.E2E.Tests.Config;

public static class TestSettings
{
    /// <summary>
    /// Base URL of the running Vite dev server.
    /// Override with the E2E_BASE_URL environment variable if needed.
    /// </summary>
    public static string FrontendBaseUrl =>
        Environment.GetEnvironmentVariable("E2E_BASE_URL") ?? "http://localhost:5173";

    /// <summary>
    /// Set E2E_HEADLESS=true to run Chrome/Brave without a visible window (e.g. in CI).
    /// </summary>
    public static bool Headless =>
        string.Equals(
            Environment.GetEnvironmentVariable("E2E_HEADLESS"),
            "true",
            StringComparison.OrdinalIgnoreCase);
}
