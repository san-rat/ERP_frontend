using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /admin (Admin Platform Overview / Dashboard).
/// Handles: page heading, section headings, metric cards.
/// </summary>
public sealed class AdminDashboardPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public AdminDashboardPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/admin");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Platform Overview')]"))
             .Any(e => e.Displayed));
    }

    // ── Section Headings ─────────────────────────────────────────────────────

    public bool HasUsersRolesSection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Users & Roles')]"))
               .Any(e => e.Displayed);

    public bool HasBusinessDataSection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Business Data')]"))
               .Any(e => e.Displayed);

    // ── Metric Cards ─────────────────────────────────────────────────────────

    /// <summary>Returns true if a metric card with the exact label text is visible.</summary>
    public bool HasMetricCard(string label) =>
        _driver.FindElements(By.XPath($"//*[normalize-space(text())='{label}']"))
               .Any(e => e.Displayed);
}
