using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /employee/products.
/// Handles: Add Product modal and Edit Product modal.
/// </summary>
public sealed class EmployeeProductsPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public EmployeeProductsPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/employee/products");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        // The "Add Product" button is the landmark that confirms the page is rendered
        _wait.Until(d =>
            d.FindElements(By.XPath("//button[contains(.,'Add Product')]"))
             .Any(e => e.Displayed));
    }

    // ── Modal – Add Product ──────────────────────────────────────────────────

    public void OpenAddProductModal()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.XPath("//button[contains(.,'Add Product')]"))
             .FirstOrDefault(e => e.Displayed && e.Enabled));
        if (btn is null) throw new Exception("'Add Product' button not found.");
        ((IJavaScriptExecutor)_driver).ExecuteScript("arguments[0].scrollIntoView(true);", btn);
        ((IJavaScriptExecutor)_driver).ExecuteScript("arguments[0].click();", btn);
        WaitForModal("New Product");
    }

    /// <summary>Fill every field in the Add-Product slide panel and submit.</summary>
    public void AddProduct(string sku, string name, string description,
                           string categoryVisible, string price,
                           string initialStock, string lowStockThreshold)
    {
        OpenAddProductModal();

        FillInput("SKU",            sku);
        FillInput("Name",           name);
        FillTextArea("Description", description);
        SelectByText("Category",    categoryVisible);
        FillInput("Price",          price);
        FillInput("Initial Stock",  initialStock);
        FillInput("Low Stock Alert", lowStockThreshold);

        ClickSubmit();
        WaitForModalClosed();
    }

    // ── Modal – Edit Product ─────────────────────────────────────────────────

    /// <summary>Click the pencil icon in the row whose SKU matches.</summary>
    public void OpenEditModalForSku(string sku)
    {
        var row = WaitForRowContaining(sku);
        // The edit button is the only <button> in each row
        row.FindElement(By.CssSelector("button")).Click();
        WaitForModal("Edit Product");
    }

    /// <summary>Edit product fields (SKU is disabled in edit mode).</summary>
    public void EditProduct(string sku, string newName, string newPrice,
                            string newQuantity, string newLowStockThreshold)
    {
        OpenEditModalForSku(sku);

        // Clear + retype mutable fields
        FillInput("Name",            newName);
        FillInput("Price",           newPrice);
        FillInput("Quantity",        newQuantity);          // shown only in edit mode
        FillInput("Low Stock Alert", newLowStockThreshold);

        ClickSubmit();
        WaitForModalClosed();
    }

    // ── Assertions ───────────────────────────────────────────────────────────

    public bool IsProductVisible(string productName) =>
        _driver.FindElements(By.CssSelector("table tbody td"))
               .Any(td => td.Text.Contains(productName, StringComparison.OrdinalIgnoreCase));

    public bool IsModalOpen() =>
        _driver.FindElements(By.XPath("//h3[contains(.,'New Product') or contains(.,'Edit Product')]"))
               .Any(e => e.Displayed);

    public string GetFormError()
    {
        var el = _driver.FindElements(By.CssSelector(".bg-rose-50"))
                        .FirstOrDefault(e => e.Displayed);
        return el?.Text ?? string.Empty;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /// <summary>Find input/select/textarea whose sibling label contains labelText.</summary>
    private IWebElement GetField(string labelText)
    {
        // XPath: label that contains the text → go to parent div → first input/select/textarea
        return _wait.Until(d =>
            d.FindElements(By.XPath(
                $"//label[contains(.,'{labelText}')]/..//input | " +
                $"//label[contains(.,'{labelText}')]/..//select | " +
                $"//label[contains(.,'{labelText}')]/..//textarea"))
             .FirstOrDefault(e => e.Displayed));
    }

    private void FillInput(string labelText, string value)
    {
        var field = GetField(labelText);
        field.Clear();
        field.SendKeys(value);
    }

    private void FillTextArea(string labelText, string value)
    {
        var field = _wait.Until(d =>
            d.FindElements(By.XPath($"//label[contains(.,'{labelText}')]/..//textarea"))
             .FirstOrDefault(e => e.Displayed));
        field?.Clear();
        field?.SendKeys(value);
    }

    private void SelectByText(string labelText, string visibleText)
    {
        var field = _wait.Until(d =>
            d.FindElements(By.XPath($"//label[contains(.,'{labelText}')]/..//select"))
             .FirstOrDefault(e => e.Displayed));
        if (field is null) throw new Exception($"Select for '{labelText}' not found.");
        new SelectElement(field).SelectByText(visibleText);
    }

    private void ClickSubmit()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.CssSelector("button[type='submit']"))
             .FirstOrDefault(e => e.Displayed && e.Enabled));
        if (btn is null) throw new Exception("Submit button not found or not enabled.");
        btn.Click();
    }

    private void WaitForModal(string title)
    {
        _wait.Until(d =>
            d.FindElements(By.XPath($"//h3[contains(.,'{title}')]"))
             .Any(e => e.Displayed));
    }

    private void WaitForModalClosed()
    {
        _wait.Until(d =>
            !d.FindElements(By.XPath("//h3[contains(.,'New Product') or contains(.,'Edit Product')]"))
              .Any(e => e.Displayed));
    }

    private IWebElement WaitForRowContaining(string text)
    {
        return _wait.Until(d =>
        {
            var rows = d.FindElements(By.CssSelector("table tbody tr"));
            return rows.FirstOrDefault(r =>
                r.Text.Contains(text, StringComparison.OrdinalIgnoreCase));
        }) ?? throw new Exception($"Table row containing '{text}' not found.");
    }
}
