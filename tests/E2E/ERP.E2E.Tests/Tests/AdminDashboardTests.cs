using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Admin: Platform Overview Dashboard
///
/// Covers:
///   TC-DASH-01  Dashboard loads with both section headings visible
///   TC-DASH-02  "Users & Roles" section displays the expected metric cards
///   TC-DASH-03  "Business Data" section displays the expected metric cards
/// </summary>
[TestFixture]
public class AdminDashboardTests
{
    private IWebDriver         _driver        = null!;
    private LoginPage          _loginPage     = null!;
    private AdminDashboardPage _dashboardPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver        = WebDriverFactory.Create();
        _loginPage     = new LoginPage(_driver);
        _dashboardPage = new AdminDashboardPage(_driver);

        _loginPage.Open();
        _loginPage.LoginAs("admin", "Admin@123");
        _loginPage.WaitForDashboard();

        _dashboardPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-DASH-01 ───────────────────────────────────────────────────────────

    [Test]
    [Description("The Admin Dashboard loads and shows both section headings.")]
    public void Admin_Dashboard_LoadsWithSectionHeadings()
    {
        Assert.Multiple(() =>
        {
            Assert.That(
                _dashboardPage.HasUsersRolesSection(),
                Is.True,
                "Expected 'Users & Roles' section heading.");
            Assert.That(
                _dashboardPage.HasBusinessDataSection(),
                Is.True,
                "Expected 'Business Data' section heading.");
        });
    }

    // ── TC-DASH-02 ───────────────────────────────────────────────────────────

    [Test]
    [Description("The 'Users & Roles' section shows all expected user metric cards.")]
    public void Admin_Dashboard_UsersRolesCards_AreVisible()
    {
        Assert.Multiple(() =>
        {
            Assert.That(_dashboardPage.HasMetricCard("Total Users"),    Is.True, "Expected 'Total Users' card.");
            Assert.That(_dashboardPage.HasMetricCard("Active Users"),   Is.True, "Expected 'Active Users' card.");
            Assert.That(_dashboardPage.HasMetricCard("Inactive Users"), Is.True, "Expected 'Inactive Users' card.");
            Assert.That(_dashboardPage.HasMetricCard("Admins"),         Is.True, "Expected 'Admins' card.");
            Assert.That(_dashboardPage.HasMetricCard("Managers"),       Is.True, "Expected 'Managers' card.");
            Assert.That(_dashboardPage.HasMetricCard("Employees"),      Is.True, "Expected 'Employees' card.");
        });
    }

    // ── TC-DASH-03 ───────────────────────────────────────────────────────────

    [Test]
    [Description("The 'Business Data' section shows all expected revenue and order metric cards.")]
    public void Admin_Dashboard_BusinessDataCards_AreVisible()
    {
        Assert.Multiple(() =>
        {
            Assert.That(_dashboardPage.HasMetricCard("Gross Revenue"),    Is.True, "Expected 'Gross Revenue' card.");
            Assert.That(_dashboardPage.HasMetricCard("Total Orders"),     Is.True, "Expected 'Total Orders' card.");
            Assert.That(_dashboardPage.HasMetricCard("Delivered Orders"), Is.True, "Expected 'Delivered Orders' card.");
            Assert.That(_dashboardPage.HasMetricCard("Cancelled Orders"), Is.True, "Expected 'Cancelled Orders' card.");
            Assert.That(_dashboardPage.HasMetricCard("Products"),         Is.True, "Expected 'Products' card.");
        });
    }
}
