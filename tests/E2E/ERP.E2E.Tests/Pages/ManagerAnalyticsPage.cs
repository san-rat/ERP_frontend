using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /analytics (Manager: Product Insights).
/// Handles: product metrics table, search, sort, product detail navigation.
/// </summary>
public sealed class ManagerAnalyticsPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public ManagerAnalyticsPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/analytics");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Product Insights')]"))
             .Any(e => e.Displayed));
    }

    /// <summary>Waits until the loading spinner disappears (data loaded or error shown).</summary>
    public void WaitForDataLoaded()
    {
        _wait.Until(d =>
        {
            try
            {
                return !d.FindElements(By.CssSelector(".analytics-loading"))
                          .Any(e => { try { return e.Displayed; } catch { return false; } });
            }
            catch { return false; }
        });
    }

    // ── Headings ─────────────────────────────────────────────────────────────

    public bool HasProductMetricsSection() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Product Performance Metrics')]"))
               .Any(e => e.Displayed);

    // ── Table ────────────────────────────────────────────────────────────────

    public int GetProductRowCount() =>
        _driver.FindElements(By.CssSelector("table.analytics-table tbody tr"))
               .Count(r => !string.IsNullOrWhiteSpace(r.Text));

    public bool HasNoProductsMessage() =>
        _driver.FindElements(By.CssSelector(".analytics-empty-state"))
               .Any(e => e.Displayed);

    // ── Search ────────────────────────────────────────────────────────────────

    public void TypeInSearch(string query)
    {
        var input = _wait.Until(d =>
            d.FindElements(By.CssSelector("input.analytics-search-input"))
             .FirstOrDefault(e => e.Displayed));
        if (input is null) throw new Exception("Product search input not found.");
        input.Clear();
        input.SendKeys(query);
    }

    // ── Product Detail Navigation ────────────────────────────────────────────

    /// <summary>Returns how many product links are in the metrics table.</summary>
    public int GetProductLinkCount() =>
        _driver.FindElements(By.CssSelector("a.analytics-product-link"))
               .Count(e => e.Displayed);

    /// <summary>
    /// Clicks the first product name link and waits to land on /analytics/:productId.
    /// </summary>
    public void ClickFirstProduct()
    {
        var link = _wait.Until(d =>
            d.FindElements(By.CssSelector("a.analytics-product-link"))
             .FirstOrDefault(e => e.Displayed));
        if (link is null) throw new Exception("No product links found in the analytics table.");
        link.Click();
        // URL changes from /analytics to /analytics/<id>
        _wait.Until(d => d.Url.Contains("/analytics/") &&
                         !d.Url.TrimEnd('/').EndsWith("/analytics"));
    }

    // ── Back Navigation ──────────────────────────────────────────────────────

    public void ClickBackToDashboard()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.CssSelector("button.analytics-back-btn"))
             .FirstOrDefault(e => e.Displayed));
        if (btn is null) throw new Exception("'Back to Dashboard' button not found.");
        btn.Click();
        _wait.Until(d => d.Url.TrimEnd('/').EndsWith("5173") ||
                         d.Url.TrimEnd('/').EndsWith("localhost:5173") ||
                         d.Url.EndsWith("/"));
    }
}
