using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /customer-insights (Manager: Customer Insights)
/// and /customer-insights/:customerId/orders (Customer Order History).
///
/// Handles: stats cards, churn analysis table, order history table,
/// search, pagination, and navigation to customer order history.
/// </summary>
public sealed class ManagerCustomerInsightsPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public ManagerCustomerInsightsPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/customer-insights");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        // Wait for the loading spinner to disappear (it renders as a full-page div)
        _wait.Until(d =>
            !d.FindElements(By.CssSelector(".cip-loading"))
              .Any(e => e.Displayed));

        // Then wait for the h1 to appear
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Customer Insights')]"))
             .Any(e => e.Displayed));
    }

    // ── Stats Cards ──────────────────────────────────────────────────────────

    /// <summary>Returns true if the stat card with the given label is visible.</summary>
    public bool HasStatCard(string label) =>
        _driver.FindElements(By.XPath($"//label[normalize-space(text())='{label}']"))
               .Any(e => e.Displayed);

    // ── Churn Analysis ───────────────────────────────────────────────────────

    public bool HasChurnAnalysisSection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Customer Churn Analysis')]"))
               .Any(e => e.Displayed);

    /// <summary>Number of customer links in the Churn Analysis table.</summary>
    public int GetCustomerLinkCount() =>
        _driver.FindElements(By.CssSelector("a.cip-customer-link"))
               .Count(e => e.Displayed);

    /// <summary>
    /// Clicks the first customer ID link and waits to land on
    /// /customer-insights/:customerId/orders.
    /// </summary>
    public void ClickFirstCustomerLink()
    {
        var link = _wait.Until(d =>
            d.FindElements(By.CssSelector("a.cip-customer-link"))
             .FirstOrDefault(e => e.Displayed));
        if (link is null) throw new Exception("No customer links found in the Churn Analysis table.");
        link.Click();
        _wait.Until(d => d.Url.Contains("/customer-insights/") && d.Url.Contains("/orders"));
    }

    // ── Order History Table ──────────────────────────────────────────────────

    public bool HasOrderHistorySection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Order History')]"))
               .Any(e => e.Displayed);

    /// <summary>
    /// Counts rows in the Order History table (the second cip-table on the page,
    /// after the Churn Analysis table).
    /// </summary>
    public int GetOrderHistoryRowCount()
    {
        var tables = _driver.FindElements(By.CssSelector("table.cip-table"));
        if (tables.Count < 2) return 0;
        return tables[1].FindElements(By.CssSelector("tbody tr"))
                        .Count(r => !string.IsNullOrWhiteSpace(r.Text));
    }

    // ── Order History Search ─────────────────────────────────────────────────

    public void TypeInOrderSearch(string query)
    {
        var input = _wait.Until(d =>
            d.FindElements(By.XPath("//input[@placeholder='Search by ID or Customer...']"))
             .FirstOrDefault(e => e.Displayed));
        if (input is null) throw new Exception("Order History search input not found.");
        input.Clear();
        input.SendKeys(query);
    }

    // ── Customer Order History Page ──────────────────────────────────────────
    // (used after navigating via ClickFirstCustomerLink)

    public bool IsOnCustomerOrderHistoryPage() =>
        _driver.FindElements(By.XPath("//h1[contains(.,'Order History for')]"))
               .Any(e => e.Displayed);

    public bool HasAllOrdersSection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'All Orders')]"))
               .Any(e => e.Displayed);

    public int GetCustomerOrderRowCount() =>
        _driver.FindElements(By.CssSelector("table.coh-table tbody tr"))
               .Count(r => !string.IsNullOrWhiteSpace(r.Text));

    public void ClickBackToCustomerInsights()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.CssSelector("button.coh-back-btn"))
             .FirstOrDefault(e => e.Displayed));
        if (btn is null) throw new Exception("'Back to Customer Insights' button not found.");
        btn.Click();
        _wait.Until(d => d.Url.TrimEnd('/').EndsWith("/customer-insights"));
    }
}
