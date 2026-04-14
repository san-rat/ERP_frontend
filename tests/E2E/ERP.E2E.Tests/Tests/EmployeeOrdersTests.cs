using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Employee: Order Management
///
/// Covers:
///   TC-ORD-01  Orders page loads and shows order rows
///   TC-ORD-02  Search input filters the orders table
///   TC-ORD-03  Status filter dropdown limits visible orders
///   TC-ORD-04  Clicking an order row opens the detail drawer
///   TC-ORD-05  Order detail drawer can be closed with the X button
/// </summary>
[TestFixture]
public class EmployeeOrdersTests
{
    private IWebDriver         _driver     = null!;
    private LoginPage          _loginPage  = null!;
    private EmployeeOrdersPage _ordersPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver     = WebDriverFactory.Create();
        _loginPage  = new LoginPage(_driver);
        _ordersPage = new EmployeeOrdersPage(_driver);

        // Log in as employee before every test
        _loginPage.Open();
        _loginPage.LoginAs("employee", "Employee@123");
        _loginPage.WaitForDashboard();

        _ordersPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-ORD-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Orders page loads and displays at least one order row.")]
    public void Employee_OrdersPage_LoadsWithOrderRows()
    {
        Assert.That(
            _ordersPage.HasOrderRows(),
            Is.True,
            "Expected at least one order row to be visible on the Orders page.");
    }

    // ── TC-ORD-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Typing a non-matching query in the search box reduces the visible rows.")]
    public void Employee_OrdersSearch_FiltersTable()
    {
        var beforeCount = _ordersPage.GetVisibleRowCount();

        // Type a random string unlikely to match any real order
        _ordersPage.TypeInSearch("ZZZNOTFOUND999");

        // Table should be empty (or at least fewer rows than before)
        var afterCount = _ordersPage.GetVisibleRowCount();
        Assert.That(
            afterCount,
            Is.LessThan(beforeCount),
            "Searching for a non-existent term should reduce the number of visible rows.");
    }

    // ── TC-ORD-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Selecting 'Delivered' from the status filter shows only DELIVERED orders (or an empty table).")]
    public void Employee_StatusFilter_FiltersByStatus()
    {
        // Record unfiltered count
        var allCount = _ordersPage.GetVisibleRowCount();

        _ordersPage.SelectStatusFilter("Delivered");

        // Every visible row should contain the DELIVERED badge
        // If no delivered orders exist the table may be empty — both are acceptable
        var rows = _driver.FindElements(By.CssSelector("table tbody tr"));
        foreach (var row in rows)
        {
            Assert.That(
                row.Text,
                Does.Contain("Delivered").Or.Contain("DELIVERED"),
                "All visible rows should show DELIVERED status when that filter is selected.");
        }

        Assert.Pass("Status filter applied without errors.");
    }

    // ── TC-ORD-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Clicking an order row opens the Order Details drawer.")]
    public void Employee_ClickOrderRow_OpensDetailDrawer()
    {
        _ordersPage.ClickFirstOrderRow();

        Assert.That(
            _ordersPage.IsDrawerOpen(),
            Is.True,
            "The 'Order Details' drawer should be visible after clicking an order row.");
    }

    // ── TC-ORD-05 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Order Details drawer closes when the X button is clicked.")]
    public void Employee_OrderDetailsDrawer_ClosesWithXButton()
    {
        _ordersPage.ClickFirstOrderRow();
        Assert.That(_ordersPage.IsDrawerOpen(), Is.True, "Drawer should be open first.");

        _ordersPage.CloseDrawer();

        Assert.That(
            _ordersPage.IsDrawerOpen(),
            Is.False,
            "The drawer should no longer be visible after clicking X.");
    }
}
