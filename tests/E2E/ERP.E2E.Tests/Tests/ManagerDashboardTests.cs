using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Manager: Home Dashboard (/)
///
/// Covers:
///   TC-MGR-01  Dashboard loads with "Manager Dashboard" heading and all three KPI section cards
///   TC-MGR-02  Recent Orders section is visible with at least one order row
///   TC-MGR-03  "Product Insights" button navigates to /analytics
///   TC-MGR-04  "Customer Insights" button navigates to /customer-insights
/// </summary>
[TestFixture]
public class ManagerDashboardTests
{
    private IWebDriver          _driver        = null!;
    private LoginPage           _loginPage     = null!;
    private ManagerDashboardPage _dashboardPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver        = WebDriverFactory.Create();
        _loginPage     = new LoginPage(_driver);
        _dashboardPage = new ManagerDashboardPage(_driver);

        _loginPage.Open();
        _loginPage.LoginAs("manager", "Admin@123");
        _loginPage.WaitForDashboard();

        _dashboardPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-MGR-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Manager Dashboard loads and displays all three KPI section cards.")]
    public void Manager_Dashboard_LoadsWithKpiSections()
    {
        Assert.Multiple(() =>
        {
            Assert.That(
                _dashboardPage.HasKpiSection("Total Revenue"),
                Is.True,
                "Expected 'Total Revenue' KPI section card.");
            Assert.That(
                _dashboardPage.HasKpiSection("Active Orders"),
                Is.True,
                "Expected 'Active Orders' KPI section card.");
            Assert.That(
                _dashboardPage.HasKpiSection("Total Customers"),
                Is.True,
                "Expected 'Total Customers' KPI section card.");
        });
    }

    // ── TC-MGR-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Recent Orders section is visible and contains at least one order row.")]
    public void Manager_Dashboard_ShowsRecentOrders()
    {
        Assert.That(
            _dashboardPage.HasRecentOrdersSection(),
            Is.True,
            "Expected 'Recent Orders' section heading.");

        Assert.That(
            _dashboardPage.GetRecentOrderRowCount(),
            Is.GreaterThan(0),
            "Expected at least one row in the Recent Orders table.");
    }

    // ── TC-MGR-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Clicking 'Product Insights' navigates to the Product Analytics page (/analytics).")]
    public void Manager_Dashboard_ProductInsights_Navigates()
    {
        _dashboardPage.ClickProductInsights();

        Assert.That(
            _driver.Url,
            Does.Contain("/analytics"),
            "Expected to navigate to /analytics after clicking 'Product Insights'.");
    }

    // ── TC-MGR-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Clicking 'Customer Insights' navigates to the Customer Insights page (/customer-insights).")]
    public void Manager_Dashboard_CustomerInsights_Navigates()
    {
        _dashboardPage.ClickCustomerInsights();

        Assert.That(
            _driver.Url,
            Does.Contain("/customer-insights"),
            "Expected to navigate to /customer-insights after clicking 'Customer Insights'.");
    }
}
