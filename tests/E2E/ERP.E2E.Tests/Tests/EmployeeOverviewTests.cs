using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Employee: Overview / Dashboard
///
/// Covers:
///   TC-OVR-01  Overview page loads and shows all four KPI cards
///   TC-OVR-02  Recent Orders section is visible with at least one row
///   TC-OVR-03  "View all orders" link navigates to the Orders page
/// </summary>
[TestFixture]
public class EmployeeOverviewTests
{
    private IWebDriver           _driver       = null!;
    private LoginPage            _loginPage    = null!;
    private EmployeeOverviewPage _overviewPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver       = WebDriverFactory.Create();
        _loginPage    = new LoginPage(_driver);
        _overviewPage = new EmployeeOverviewPage(_driver);

        _loginPage.Open();
        _loginPage.LoginAs("employee", "Employee@123");
        _loginPage.WaitForDashboard();

        _overviewPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-OVR-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Overview page loads and displays all four KPI cards.")]
    public void Employee_OverviewPage_ShowsKpiCards()
    {
        Assert.Multiple(() =>
        {
            Assert.That(_overviewPage.HasKpiCard("New Orders"),       Is.True, "Expected 'New Orders' KPI card.");
            Assert.That(_overviewPage.HasKpiCard("In Progress"),      Is.True, "Expected 'In Progress' KPI card.");
            Assert.That(_overviewPage.HasKpiCard("Shipped Items"),    Is.True, "Expected 'Shipped Items' KPI card.");
            Assert.That(_overviewPage.HasKpiCard("Low Stock Alerts"), Is.True, "Expected 'Low Stock Alerts' KPI card.");
        });
    }

    // ── TC-OVR-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Recent Orders section is visible and contains at least one order row.")]
    public void Employee_OverviewPage_ShowsRecentOrders()
    {
        Assert.Multiple(() =>
        {
            Assert.That(
                _overviewPage.HasRecentOrdersSection(),
                Is.True,
                "Expected 'Recent Orders' section heading.");
            Assert.That(
                _overviewPage.GetRecentOrderRowCount(),
                Is.GreaterThan(0),
                "Expected at least one row in the Recent Orders table.");
        });
    }

    // ── TC-OVR-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Clicking 'View all orders' navigates to the Employee Orders page.")]
    public void Employee_OverviewPage_ViewAllOrdersNavigatesToOrders()
    {
        Assert.That(
            _overviewPage.HasViewAllOrdersLink(),
            Is.True,
            "Expected 'View all orders' link to be present.");

        _overviewPage.ClickViewAllOrders();

        Assert.That(
            _driver.Url,
            Does.Contain("/employee/orders"),
            "Expected to navigate to the Orders page after clicking 'View all orders'.");
    }
}
