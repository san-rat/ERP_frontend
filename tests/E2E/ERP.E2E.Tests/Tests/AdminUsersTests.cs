using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Admin: Staff Management (Users)
///
/// Covers:
///   TC-USR-01  Staff Management page loads and shows at least one user row
///   TC-USR-02  Search input filters the users table
///   TC-USR-03  Role filter dropdown limits visible users to Employees
///   TC-USR-04  "Add New User" opens the creation modal; Cancel closes it
/// </summary>
[TestFixture]
public class AdminUsersTests
{
    private IWebDriver     _driver    = null!;
    private LoginPage      _loginPage = null!;
    private AdminUsersPage _usersPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver    = WebDriverFactory.Create();
        _loginPage = new LoginPage(_driver);
        _usersPage = new AdminUsersPage(_driver);

        _loginPage.Open();
        _loginPage.LoginAs("admin", "Admin@123");
        _loginPage.WaitForDashboard();

        _usersPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-USR-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Staff Management page loads and displays at least one user row.")]
    public void Admin_UsersPage_LoadsWithUserRows()
    {
        Assert.That(
            _usersPage.GetVisibleRowCount(),
            Is.GreaterThan(0),
            "Expected at least one user row to be visible on the Staff Management page.");
    }

    // ── TC-USR-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Typing a non-matching query in the search box reduces visible user rows.")]
    public void Admin_UsersSearch_FiltersTable()
    {
        var beforeCount = _usersPage.GetVisibleRowCount();

        _usersPage.TypeInSearch("ZZZNOTFOUND999");

        // Wait for React to re-render the filtered table
        var filterWait = new OpenQA.Selenium.Support.UI.WebDriverWait(_driver, TimeSpan.FromSeconds(5));
        filterWait.Until(d =>
            d.FindElements(By.CssSelector("table tbody tr"))
             .Count(r => !string.IsNullOrWhiteSpace(r.Text)) < beforeCount
            || d.PageSource.Contains("No users found"));

        var afterCount = _usersPage.GetVisibleRowCount();
        Assert.That(
            afterCount,
            Is.LessThan(beforeCount),
            "Searching for a non-existent term should reduce the number of visible user rows.");
    }

    // ── TC-USR-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Selecting 'Employees' from the Role filter shows only Employee rows (or an empty table).")]
    public void Admin_RoleFilter_FiltersByRole()
    {
        _usersPage.SelectRoleFilter("Employees");

        // Wait for React to re-render; re-query rows fresh to avoid StaleElementReferenceException
        var filterWait = new OpenQA.Selenium.Support.UI.WebDriverWait(_driver, TimeSpan.FromSeconds(10));
        filterWait.Until(d =>
        {
            var freshRows = d.FindElements(By.CssSelector("table tbody tr"))
                             .Where(r => { try { return !string.IsNullOrWhiteSpace(r.Text); } catch { return false; } })
                             .ToList();
            // Accept: empty table OR every row mentions "Employee"
            if (freshRows.Count == 0) return true;
            return freshRows.All(r =>
            {
                try { return r.Text.Contains("Employee", StringComparison.OrdinalIgnoreCase); }
                catch { return false; } // stale — keep waiting
            });
        });

        Assert.Pass("Role filter applied — all visible rows are Employee (or table is empty).");
    }

    // ── TC-USR-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("'Add New User' opens the creation modal and Cancel closes it.")]
    public void Admin_AddNewUser_ModalOpensAndCloses()
    {
        _usersPage.ClickAddNewUser();

        Assert.That(
            _usersPage.IsAddUserModalOpen(),
            Is.True,
            "The 'Add New Staff' modal should be visible after clicking 'Add New User'.");

        _usersPage.CloseAddUserModal();

        Assert.That(
            _usersPage.IsAddUserModalOpen(),
            Is.False,
            "The modal should no longer be visible after clicking Cancel.");
    }
}
