using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /employee/overview.
/// Handles: KPI cards, recent orders table, low-stock section, navigation links.
/// </summary>
public sealed class EmployeeOverviewPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public EmployeeOverviewPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/employee/overview");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Overview')]"))
             .Any(e => e.Displayed));
    }

    // ── KPI Cards ────────────────────────────────────────────────────────────

    /// <summary>Returns true if a KPI card with the exact label is visible on the page.</summary>
    public bool HasKpiCard(string label) =>
        _driver.FindElements(By.XPath($"//*[normalize-space(text())='{label}']"))
               .Any(e => e.Displayed);

    // ── Sections ─────────────────────────────────────────────────────────────

    public bool HasRecentOrdersSection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Recent Orders')]"))
               .Any(e => e.Displayed);

    /// <summary>Counts only real table rows — excludes skeleton loading rows.</summary>
    public int GetRecentOrderRowCount() =>
        _driver.FindElements(By.CssSelector("table tbody tr"))
               .Count(r => !string.IsNullOrWhiteSpace(r.Text));

    // ── Links ─────────────────────────────────────────────────────────────────

    public bool HasViewAllOrdersLink() =>
        _driver.FindElements(By.XPath("//a[contains(.,'View all orders')]"))
               .Any(e => e.Displayed);

    /// <summary>Clicks the "View all orders" link and waits to land on /employee/orders.</summary>
    public void ClickViewAllOrders()
    {
        var link = _wait.Until(d =>
            d.FindElements(By.XPath("//a[contains(.,'View all orders')]"))
             .FirstOrDefault(e => e.Displayed));
        if (link is null) throw new Exception("'View all orders' link not found.");
        link.Click();
        _wait.Until(d => d.Url.Contains("/employee/orders"));
    }
}
