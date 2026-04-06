using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Employee Login Flow
/// Credentials: username "employee" / password "Employee@123"
/// </summary>
[TestFixture]
public class EmployeeLoginTests
{
    private IWebDriver _driver    = null!;
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

    // ── TC-EMP-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Employee logs in with valid credentials and is redirected to the employee overview.")]
    public void Employee_ValidCredentials_ReachesEmployeeDashboard()
    {
        _loginPage.Open();
        _loginPage.LoginAs("employee", "Employee@123");

        // After login the employee is redirected to /employee/overview
        // which contains "Overview" or "Dashboard" text
        _loginPage.WaitForDashboard();

        Assert.That(
            _driver.Url,
            Does.Contain("/employee"),
            "After employee login the URL should contain '/employee'.");

        Assert.That(
            _driver.PageSource,
            Does.Contain("Overview").Or.Contain("Dashboard"),
            "The employee home page should contain 'Overview' or 'Dashboard'.");
    }

    // ── TC-EMP-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Employee login with wrong password shows error and stays on the login page.")]
    public void Employee_WrongPassword_ShowsErrorAndStaysOnLogin()
    {
        _loginPage.Open();
        _loginPage.LoginAs("employee", "WrongPass999!");

        var error = _loginPage.GetApiError();
        Assert.That(
            error,
            Does.Contain("Invalid").Or.Contain("invalid").Or.Contain("credentials"),
            "Expected an invalid-credentials error message.");

        Assert.That(
            _loginPage.IsLoginVisible(),
            Is.True,
            "User should remain on the login page after a failed attempt.");
    }

    // ── TC-EMP-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Employee can navigate to the Products page after login.")]
    public void Employee_AfterLogin_CanNavigateToProducts()
    {
        _loginPage.Open();
        _loginPage.LoginAs("employee", "Employee@123");
        _loginPage.WaitForDashboard();

        _driver.Navigate().GoToUrl("http://localhost:5173/employee/products");

        var productsPage = new EmployeeProductsPage(_driver);
        productsPage.WaitForPageReady();

        Assert.That(
            _driver.PageSource,
            Does.Contain("Product Catalog").Or.Contain("Add Product"),
            "Products page should be accessible after employee login.");
    }

    // ── TC-EMP-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Employee can navigate to the Inventory page after login.")]
    public void Employee_AfterLogin_CanNavigateToInventory()
    {
        _loginPage.Open();
        _loginPage.LoginAs("employee", "Employee@123");
        _loginPage.WaitForDashboard();

        _driver.Navigate().GoToUrl("http://localhost:5173/employee/inventory");

        var inventoryPage = new EmployeeInventoryPage(_driver);
        inventoryPage.WaitForPageReady();

        Assert.That(
            _driver.PageSource,
            Does.Contain("Inventory"),
            "Inventory page should be accessible after employee login.");
    }
}
