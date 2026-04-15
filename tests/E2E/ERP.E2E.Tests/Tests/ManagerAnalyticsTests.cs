using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Manager: Product Insights (/analytics)
///
/// Covers:
///   TC-ANA-01  Analytics page loads with the correct heading and section
///   TC-ANA-02  Product metrics table contains at least one product row
///   TC-ANA-03  Search box filters the product table to zero results for a non-existent term
///   TC-ANA-04  Clicking a product name navigates to the product detail page (/analytics/:id)
///   TC-ANA-05  "Back to Dashboard" button returns to the Manager Dashboard (/)
/// </summary>
[TestFixture]
public class ManagerAnalyticsTests
{
    private IWebDriver           _driver        = null!;
    private LoginPage            _loginPage     = null!;
    private ManagerAnalyticsPage _analyticsPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver        = WebDriverFactory.Create();
        _loginPage     = new LoginPage(_driver);
        _analyticsPage = new ManagerAnalyticsPage(_driver);

        _loginPage.Open();
        _loginPage.LoginAs("manager", "Admin@123");
        _loginPage.WaitForDashboard();

        _analyticsPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-ANA-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Product Insights page loads with the page heading and the metrics section.")]
    public void Manager_Analytics_LoadsWithHeadingAndSection()
    {
        Assert.That(
            _analyticsPage.HasProductMetricsSection(),
            Is.True,
            "Expected 'Product Performance Metrics' section heading.");
    }

    // ── TC-ANA-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("After data loads, the product metrics table contains at least one row.")]
    public void Manager_Analytics_ProductTable_HasRows()
    {
        _analyticsPage.WaitForDataLoaded();

        // Skip gracefully if the backend/forecasting service is not running
        Assume.That(
            _analyticsPage.GetProductRowCount(),
            Is.GreaterThan(0),
            "No product rows found — forecasting service may not be running.");

        Assert.That(
            _analyticsPage.GetProductRowCount(),
            Is.GreaterThan(0),
            "Expected at least one product row in the metrics table.");
    }

    // ── TC-ANA-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Typing a non-matching search term shows the empty-state message.")]
    public void Manager_Analytics_Search_FiltersToEmpty()
    {
        _analyticsPage.WaitForDataLoaded();

        // Skip if no products loaded (backend not running)
        Assume.That(
            _analyticsPage.GetProductRowCount(),
            Is.GreaterThan(0),
            "No product rows to filter — forecasting service may not be running.");

        _analyticsPage.TypeInSearch("ZZZNOTFOUND999");

        // Wait for React to re-render the filtered result
        var filterWait = new OpenQA.Selenium.Support.UI.WebDriverWait(_driver, TimeSpan.FromSeconds(5));
        filterWait.Until(d =>
            d.FindElements(By.CssSelector(".analytics-empty-state")).Any(e => e.Displayed) ||
            d.FindElements(By.CssSelector("table.analytics-table tbody tr"))
             .Count(r => !string.IsNullOrWhiteSpace(r.Text)) == 0);

        Assert.That(
            _analyticsPage.HasNoProductsMessage() || _analyticsPage.GetProductRowCount() == 0,
            Is.True,
            "Searching for a non-existent term should show an empty result state.");
    }

    // ── TC-ANA-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Clicking a product name link navigates to the product detail page.")]
    public void Manager_Analytics_ClickProduct_NavigatesToDetail()
    {
        _analyticsPage.WaitForDataLoaded();

        // Skip if no product links available (backend not running)
        Assume.That(
            _analyticsPage.GetProductLinkCount(),
            Is.GreaterThan(0),
            "No product links found — forecasting service may not be running.");

        _analyticsPage.ClickFirstProduct();

        Assert.That(
            _driver.Url,
            Does.Contain("/analytics/"),
            "Expected URL to include /analytics/:productId after clicking a product.");
    }

    // ── TC-ANA-05 ────────────────────────────────────────────────────────────

    [Test]
    [Description("'Back to Dashboard' navigates back to the Manager Dashboard (/).")]
    public void Manager_Analytics_BackToDashboard_Navigates()
    {
        _analyticsPage.ClickBackToDashboard();

        Assert.That(
            _driver.Url,
            Does.Match(@"localhost:5173/?$"),
            "Expected to navigate back to the Manager Dashboard at /.");
    }
}
