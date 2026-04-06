using ERP.E2E.Tests.Infrastructure;
using ERP.E2E.Tests.Pages;
using OpenQA.Selenium;

namespace ERP.E2E.Tests.Tests;

/// <summary>
/// E2E Tests — Employee: Add Product and Edit Product
///
/// Covers:
///   TC-PRD-01  Employee can open the "Add Product" modal
///   TC-PRD-02  Employee can add a new product successfully
///   TC-PRD-03  Newly added product appears in the products table
///   TC-PRD-04  Employee can open the "Edit Product" modal for an existing product
///   TC-PRD-05  Employee can save edits to an existing product
/// </summary>
[TestFixture]
public class EmployeeProductTests
{
    private IWebDriver           _driver       = null!;
    private LoginPage            _loginPage    = null!;
    private EmployeeProductsPage _productsPage = null!;

    // A timestamp suffix keeps SKUs unique across test runs
    private static readonly string Ts  = DateTime.UtcNow.ToString("MMddHHmm");
    private readonly string _testSku   = $"E2E-{Ts}";
    private readonly string _testName  = $"E2E Product {Ts}";

    [SetUp]
    public void SetUp()
    {
        _driver       = WebDriverFactory.Create();
        _loginPage    = new LoginPage(_driver);
        _productsPage = new EmployeeProductsPage(_driver);

        // Log in as employee before every test
        _loginPage.Open();
        _loginPage.LoginAs("employee", "Employee@123");
        _loginPage.WaitForDashboard();

        _productsPage.GoTo();
    }

    [TearDown]
    public void TearDown()
    {
        _driver.Quit();
        _driver.Dispose();
    }

    // ── TC-PRD-01 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Add Product modal opens when the 'Add Product' button is clicked.")]
    public void Employee_ClickAddProduct_OpensModal()
    {
        _productsPage.OpenAddProductModal();

        Assert.That(
            _productsPage.IsModalOpen(),
            Is.True,
            "The 'New Product' modal should be visible after clicking Add Product.");
    }

    // ── TC-PRD-02 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Employee fills in the Add Product form and submits it; modal closes without error.")]
    public void Employee_AddProduct_FormSubmitsSuccessfully()
    {
        _productsPage.AddProduct(
            sku:              _testSku,
            name:             _testName,
            description:      "Automated test product – safe to delete",
            categoryVisible:  "Electronics",   // matches PRODUCT_CATEGORIES seed data
            price:            "49.99",
            initialStock:     "20",
            lowStockThreshold:"5");

        // If the modal closed cleanly there was no validation error
        Assert.That(
            _productsPage.IsModalOpen(),
            Is.False,
            "Modal should be closed after a successful product creation.");
    }

    // ── TC-PRD-03 ────────────────────────────────────────────────────────────

    [Test]
    [Description("After adding a product its name appears in the products table.")]
    public void Employee_AddProduct_NewProductAppearsInTable()
    {
        _productsPage.AddProduct(
            sku:              _testSku,
            name:             _testName,
            description:      "Automated test product – safe to delete",
            categoryVisible:  "Electronics",
            price:            "49.99",
            initialStock:     "20",
            lowStockThreshold:"5");

        Assert.That(
            _productsPage.IsProductVisible(_testName),
            Is.True,
            $"Product '{_testName}' should appear in the table after being created.");
    }

    // ── TC-PRD-04 ────────────────────────────────────────────────────────────

    [Test]
    [Description("The Edit Product modal opens when the pencil icon is clicked.")]
    public void Employee_ClickEditProduct_OpensEditModal()
    {
        // Use a known seeded product SKU (from migration 002_seed_products.sql)
        _productsPage.OpenEditModalForSku("LAPTOP-001");

        Assert.That(
            _productsPage.IsModalOpen(),
            Is.True,
            "The 'Edit Product' modal should open when the edit button is clicked.");
    }

    // ── TC-PRD-05 ────────────────────────────────────────────────────────────

    [Test]
    [Description("Employee edits a product's name and price; changes are saved without errors.")]
    public void Employee_EditProduct_SavesChangesSuccessfully()
    {
        // Edit the seeded Dell Laptop product
        _productsPage.EditProduct(
            sku:                  "LAPTOP-001",
            newName:              "Dell Laptop 15 (Updated)",
            newPrice:             "1099.99",
            newQuantity:          "25",
            newLowStockThreshold: "3");

        Assert.Multiple(() =>
        {
            Assert.That(
                _productsPage.IsModalOpen(),
                Is.False,
                "Modal should close after saving edits.");

            Assert.That(
                _productsPage.IsProductVisible("Dell Laptop 15 (Updated)"),
                Is.True,
                "The updated product name should appear in the table.");
        });
    }
}
