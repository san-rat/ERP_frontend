using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for / (Manager Home Dashboard — HomePage.jsx).
/// Handles: KPI section cards, recent orders table, navigation to sub-pages.
/// </summary>
public sealed class ManagerDashboardPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public ManagerDashboardPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Manager Dashboard')]"))
             .Any(e => e.Displayed));
    }

    // ── KPI Section Cards ────────────────────────────────────────────────────

    /// <summary>Returns true if a KPI section card with the given h2 title is visible.</summary>
    public bool HasKpiSection(string title) =>
        _driver.FindElements(By.XPath($"//h2[normalize-space(text())='{title}']"))
               .Any(e => e.Displayed);

    // ── Recent Orders ────────────────────────────────────────────────────────

    public bool HasRecentOrdersSection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Recent Orders')]"))
               .Any(e => e.Displayed);

    /// <summary>Counts rows in the recent orders table that have actual content.</summary>
    public int GetRecentOrderRowCount() =>
        _driver.FindElements(By.CssSelector("table.hp-table tbody tr"))
               .Count(r => !string.IsNullOrWhiteSpace(r.Text));

    // ── Page Action Buttons ──────────────────────────────────────────────────

    /// <summary>
    /// Clicks "Product Insights" from the page header action buttons and waits
    /// for the browser to land on /analytics.
    /// </summary>
    public void ClickProductInsights()
    {
        // Use the page-header action buttons (hp-btn-secondary class)
        var btn = _wait.Until(d =>
            d.FindElements(By.CssSelector(".hp-page-actions button"))
             .FirstOrDefault(e => e.Displayed && e.Text.Contains("Product Insights")));
        if (btn is null) throw new Exception("'Product Insights' page action button not found.");
        btn.Click();
        _wait.Until(d => d.Url.Contains("/analytics"));
    }

    /// <summary>
    /// Clicks "Customer Insights" from the page header action buttons and waits
    /// for the browser to land on /customer-insights.
    /// </summary>
    public void ClickCustomerInsights()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.CssSelector(".hp-page-actions button"))
             .FirstOrDefault(e => e.Displayed && e.Text.Contains("Customer Insights")));
        if (btn is null) throw new Exception("'Customer Insights' page action button not found.");
        btn.Click();
        _wait.Until(d => d.Url.Contains("/customer-insights"));
    }
}
