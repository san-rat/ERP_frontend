using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Employee: Inventory Adjust Stock
///
/// Covers:
///   TC-INV-01  Inventory page loads and displays stock rows
///   TC-INV-02  "Adjust Stock" modal opens when the pencil icon is clicked
///   TC-INV-03  Employee can set a new quantity and save it (value persists in the table)
///   TC-INV-04  Cancelling the Adjust Stock modal leaves the quantity unchanged
/// </summary>
[TestFixture]
public class EmployeeInventoryTests
{
    private IWebDriver            _driver        = null!;
    private LoginPage             _loginPage     = null!;
    private EmployeeInventoryPage _inventoryPage = null!;

    [SetUp]
    public void SetUp()
    {
        _driver        = WebDriverFactory.Create();
        _loginPage     = new LoginPage(_driver);
        _inventoryPage = new EmployeeInventoryPage(_driver);

        // Log in as employee before every test
        _loginPage.Open();
        _loginPage.LoginAs("employee", "Employee@123");
        _loginPage.WaitForDashboard();

        _inventoryPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-INV-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Inventory page loads and shows at least one stock row.")]
    public void Employee_InventoryPage_LoadsWithStockRows()
    {
        Assert.That(
            _inventoryPage.HasInventoryRows(),
            Is.True,
            "Expected at least one inventory row to be displayed.");
    }

    // ── TC-INV-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Clicking the Adjust Stock (pencil) button opens the Adjust Stock modal.")]
    public void Employee_ClickAdjustStock_OpensModal()
    {
        // "Dell Laptop 15" is seeded in migration 002; adjust to match actual product name
        _inventoryPage.OpenAdjustStockFor("LAPTOP-001");

        Assert.That(
            _inventoryPage.IsAdjustModalOpen(),
            Is.True,
            "The 'Adjust Stock' modal should be visible after clicking the pencil icon.");
    }

    // ── TC-INV-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Employee sets a new stock quantity; the modal closes and the new value appears in the table.")]
    public void Employee_AdjustStock_NewQuantityAppearsInTable()
    {
        const string productSku  = "LAPTOP-001";
        const string newQty      = "77";

        _inventoryPage.AdjustStock(productSku, newQty);

        // After saving the modal should be gone
        Assert.That(
            _inventoryPage.IsAdjustModalOpen(),
            Is.False,
            "Modal should close after saving the new quantity.");

        // The updated quantity should reflect in the "Available" column
        var displayed = _inventoryPage.GetAvailableQtyFor(productSku);
        Assert.That(
            displayed,
            Is.EqualTo(newQty),
            $"The Available column for '{productSku}' should show '{newQty}' after adjustment.");
    }

    // ── TC-INV-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Cancelling the Adjust Stock modal leaves the quantity unchanged.")]
    public void Employee_CancelAdjustStock_QuantityUnchanged()
    {
        const string productSku = "PHONE-001";

        // Record the quantity before opening the modal
        var before = _inventoryPage.GetAvailableQtyFor(productSku);

        // Open modal and cancel
        _inventoryPage.OpenAdjustStockFor(productSku);
        Assert.That(_inventoryPage.IsAdjustModalOpen(), Is.True);

        // Click Cancel button
        _driver.FindElement(By.XPath("//button[contains(.,'Cancel')]")).Click();

        // Wait for modal to close (the Cancel button dismisses it immediately)
        var wait = new OpenQA.Selenium.Support.UI.WebDriverWait(_driver, TimeSpan.FromSeconds(5));
        wait.Until(d => !_inventoryPage.IsAdjustModalOpen());

        var after = _inventoryPage.GetAvailableQtyFor(productSku);
        Assert.That(
            after,
            Is.EqualTo(before),
            "Available quantity should be unchanged after cancelling the modal.");
    }
}
