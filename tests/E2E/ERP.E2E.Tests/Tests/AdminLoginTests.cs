using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Admin Login Flow
/// Credentials: username "Admin" / password "Admin@123"
/// </summary>
[TestFixture]
public class AdminLoginTests
{
    private IWebDriver _driver = null!;
    private LoginPage  _loginPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver    = WebDriverFactory.Create();
        _loginPage = new LoginPage(_driver);
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-ADM-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Admin can log in with valid credentials and is redirected to the admin dashboard.")]
    public void Admin_ValidCredentials_ReachesAdminDashboard()
    {
        _loginPage.Open();
        _loginPage.LoginAs("Admin", "Admin@123");
        _loginPage.WaitForDashboard();

        Assert.That(
            _driver.PageSource,
            Does.Contain("Dashboard"),
            "After admin login the page should contain 'Dashboard'.");
    }

    // ── TC-ADM-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Admin login with the wrong password stays on login and shows an error.")]
    public void Admin_WrongPassword_ShowsErrorAndStaysOnLogin()
    {
        _loginPage.Open();
        _loginPage.LoginAs("Admin", "BadPassword999!");

        var error = _loginPage.GetApiError();
        Assert.That(
            error,
            Does.Contain("Invalid").Or.Contain("invalid").Or.Contain("credentials"),
            "Expected an 'Invalid credentials' error message.");

        Assert.That(
            _loginPage.IsLoginVisible(),
            Is.True,
            "User should remain on the login page after a failed attempt.");
    }

    // ── TC-ADM-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Login page has both username and password fields visible on first load.")]
    public void Admin_LoginPage_HasUsernameAndPasswordFields()
    {
        _loginPage.Open();

        Assert.Multiple(() =>
        {
            Assert.That(_driver.FindElement(By.Id("username")).Displayed, Is.True,
                "Username field should be visible.");
            Assert.That(_driver.FindElement(By.Id("password")).Displayed, Is.True,
                "Password field should be visible.");
        });
    }
}
