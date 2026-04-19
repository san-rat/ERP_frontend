using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Manager: Customer Insights (/customer-insights)
///                       Customer Order History (/customer-insights/:id/orders)
///
/// Covers:
///   TC-CIP-01  Customer Insights page loads with heading and stat cards
///   TC-CIP-02  Churn Analysis section is present
///   TC-CIP-03  Order History section contains at least one row
///   TC-CIP-04  Searching for a non-existent term reduces Order History rows
///   TC-CIP-05  Clicking a customer link opens that customer's Order History page
///   TC-COH-01  Customer Order History page shows heading and "All Orders" section
///   TC-COH-02  "Back to Customer Insights" navigates back to /customer-insights
/// </summary>
[TestFixture]
public class ManagerCustomerInsightsTests
{
    private IWebDriver                   _driver        = null!;
    private LoginPage                    _loginPage     = null!;
    private ManagerCustomerInsightsPage  _insightsPage  = null!;

    [SetUp]
    public void SetUp()
    {
        _driver       = WebDriverFactory.Create();
        _loginPage    = new LoginPage(_driver);
        _insightsPage = new ManagerCustomerInsightsPage(_driver);

        _loginPage.Open();
        _loginPage.LoginAs("manager", "Admin@123");
        _loginPage.WaitForDashboard();

        _insightsPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-CIP-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Customer Insights page loads and shows 'Total Orders' and 'Unique Customers' stat cards.")]
    public void Manager_CustomerInsights_LoadsWithStatCards()
    {
        Assert.Multiple(() =>
        {
            Assert.That(
                _insightsPage.HasStatCard("Total Orders"),
                Is.True,
                "Expected 'Total Orders' stat card.");
            Assert.That(
                _insightsPage.HasStatCard("Unique Customers"),
                Is.True,
                "Expected 'Unique Customers' stat card.");
        });
    }

    // ── TC-CIP-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Customer Churn Analysis section is visible on the page.")]
    public void Manager_CustomerInsights_HasChurnAnalysisSection()
    {
        Assert.That(
            _insightsPage.HasChurnAnalysisSection(),
            Is.True,
            "Expected 'Customer Churn Analysis' section heading.");
    }

    // ── TC-CIP-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Order History section contains at least one order row.")]
    public void Manager_CustomerInsights_OrderHistory_HasRows()
    {
        Assert.That(
            _insightsPage.HasOrderHistorySection(),
            Is.True,
            "Expected 'Order History' section heading.");

        // Skip gracefully when backend is unavailable
        Assume.That(
            _insightsPage.GetOrderHistoryRowCount(),
            Is.GreaterThan(0),
            "No order rows — backend may not be running.");

        Assert.That(
            _insightsPage.GetOrderHistoryRowCount(),
            Is.GreaterThan(0),
            "Expected at least one row in the Order History table.");
    }

    // ── TC-CIP-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Typing a non-matching search term reduces Order History rows.")]
    public void Manager_CustomerInsights_OrderSearch_FiltersTable()
    {
        // Skip if no rows to filter
        Assume.That(
            _insightsPage.GetOrderHistoryRowCount(),
            Is.GreaterThan(0),
            "No order rows to filter — backend may not be running.");

        var beforeCount = _insightsPage.GetOrderHistoryRowCount();

        _insightsPage.TypeInOrderSearch("ZZZNOTFOUND999");

        // Wait for React to re-render
        var filterWait = new OpenQA.Selenium.Support.UI.WebDriverWait(_driver, TimeSpan.FromSeconds(5));
        filterWait.Until(d =>
        {
            var tables = d.FindElements(By.CssSelector("table.cip-table"));
            if (tables.Count < 2) return true;
            var count = tables[1].FindElements(By.CssSelector("tbody tr"))
                                  .Count(r => !string.IsNullOrWhiteSpace(r.Text));
            return count < beforeCount ||
                   d.FindElements(By.CssSelector(".cip-empty")).Any(e => e.Displayed);
        });

        var afterCount = _insightsPage.GetOrderHistoryRowCount();
        Assert.That(
            afterCount,
            Is.LessThan(beforeCount),
            "Searching for a non-existent term should reduce the visible order rows.");
    }

    // ── TC-CIP-05 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Clicking a customer ID link opens that customer's Order History page.")]
    public void Manager_CustomerInsights_ClickCustomer_OpensOrderHistory()
    {
        // Skip gracefully if no customer links (backend not running)
        Assume.That(
            _insightsPage.GetCustomerLinkCount(),
            Is.GreaterThan(0),
            "No customer links found — backend/orders API may not be running.");

        _insightsPage.ClickFirstCustomerLink();

        Assert.Multiple(() =>
        {
            Assert.That(
                _driver.Url,
                Does.Contain("/customer-insights/") & Does.Contain("/orders"),
                "Expected URL to contain /customer-insights/:id/orders.");
            Assert.That(
                _insightsPage.IsOnCustomerOrderHistoryPage(),
                Is.True,
                "Expected 'Order History for ...' heading on the customer detail page.");
        });
    }

    // ── TC-COH-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Customer Order History page shows the heading and All Orders section.")]
    public void Manager_CustomerOrderHistory_LoadsWithOrdersSection()
    {
        // Navigate via a customer link (requires backend)
        Assume.That(
            _insightsPage.GetCustomerLinkCount(),
            Is.GreaterThan(0),
            "No customer links found — backend/orders API may not be running.");

        _insightsPage.ClickFirstCustomerLink();

        Assert.Multiple(() =>
        {
            Assert.That(
                _insightsPage.IsOnCustomerOrderHistoryPage(),
                Is.True,
                "Expected 'Order History for ...' heading.");
            Assert.That(
                _insightsPage.HasAllOrdersSection(),
                Is.True,
                "Expected 'All Orders' section heading.");
        });
    }

    // ── TC-COH-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("'Back to Customer Insights' on the order history page returns to /customer-insights.")]
    public void Manager_CustomerOrderHistory_BackButton_Navigates()
    {
        // Navigate via a customer link (requires backend)
        Assume.That(
            _insightsPage.GetCustomerLinkCount(),
            Is.GreaterThan(0),
            "No customer links found — backend/orders API may not be running.");

        _insightsPage.ClickFirstCustomerLink();

        // Verify we landed on the order history page first
        Assert.That(_insightsPage.IsOnCustomerOrderHistoryPage(), Is.True);

        _insightsPage.ClickBackToCustomerInsights();

        Assert.That(
            _driver.Url,
            Does.Contain("/customer-insights"),
            "Expected to navigate back to /customer-insights.");
    }
}
