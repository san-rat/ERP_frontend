using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /employee/inventory.
/// Handles: viewing stock levels and adjusting available quantity.
/// </summary>
public sealed class EmployeeInventoryPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public EmployeeInventoryPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/employee/inventory");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Inventory')]"))
             .Any(e => e.Displayed));
    }

    // ── Adjust Stock Modal ───────────────────────────────────────────────────

    /// <summary>
    /// Click the pencil icon in the first row that contains <paramref name="productNameOrSku"/>.
    /// Opens the "Adjust Stock" modal.
    /// </summary>
    public void OpenAdjustStockFor(string productNameOrSku)
    {
        var row = WaitForRowContaining(productNameOrSku);
        var btn = row.FindElement(By.CssSelector("button"));
        // JS click bypasses element-interception issues and reliably fires React's onClick
        ((IJavaScriptExecutor)_driver).ExecuteScript("arguments[0].click();", btn);

        // openEditModal makes a backend API call (getById). If it fails, the page shows a
        // native alert and closes the modal. Detect and accept any such alert early.
        var alertWait = new WebDriverWait(_driver, TimeSpan.FromSeconds(3));
        try
        {
            alertWait.Until(d =>
            {
                try { d.SwitchTo().Alert(); return true; }
                catch (OpenQA.Selenium.NoAlertPresentException) { return false; }
            });
            _driver.SwitchTo().Alert().Accept();
            throw new Exception("__BACKEND_ALERT__");  // signals backend unavailable
        }
        catch (WebDriverTimeoutException)
        {
            // No alert appeared — modal should be open
        }

        WaitForAdjustModal();
    }

    /// <summary>Set the new quantity and click Save Quantity.</summary>
    public void AdjustStock(string productNameOrSku, string newQuantity)
    {
        OpenAdjustStockFor(productNameOrSku);

        var input = _wait.Until(d =>
            d.FindElements(By.CssSelector("input[type='number']"))
             .FirstOrDefault(e => e.Displayed));

        if (input is null) throw new Exception("Quantity input not found in Adjust Stock modal.");

        input.Clear();
        input.SendKeys(newQuantity);

        // Click "Save Quantity"
        var saveBtn = _wait.Until(d =>
            d.FindElements(By.XPath("//button[contains(.,'Save Quantity')]"))
             .FirstOrDefault(e => e.Displayed && e.Enabled));
        if (saveBtn is null) throw new Exception("'Save Quantity' button not found.");
        saveBtn.Click();

        WaitForAdjustModalClosed();
    }

    // ── Assertions ───────────────────────────────────────────────────────────

    public bool IsAdjustModalOpen() =>
        _driver.FindElements(By.XPath("//h3[contains(.,'Adjust Stock')]"))
               .Any(e => e.Displayed);

    public bool HasInventoryRows() =>
        _driver.FindElements(By.CssSelector("table tbody tr")).Count > 0;

    /// <summary>
    /// Returns the text in the "Available" column (3rd column, index 2) for the matching row.
    /// </summary>
    public string GetAvailableQtyFor(string productNameOrSku)
    {
        var row = _driver.FindElements(By.CssSelector("table tbody tr"))
                         .FirstOrDefault(r => r.Text.Contains(productNameOrSku, StringComparison.OrdinalIgnoreCase));

        if (row is null) return string.Empty;

        var cells = row.FindElements(By.TagName("td"));
        return cells.Count > 2 ? cells[2].Text.Trim() : string.Empty;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private IWebElement WaitForRowContaining(string text)
    {
        return _wait.Until(d =>
        {
            var rows = d.FindElements(By.CssSelector("table tbody tr"));
            return rows.FirstOrDefault(r =>
                r.Text.Contains(text, StringComparison.OrdinalIgnoreCase));
        }) ?? throw new Exception($"Inventory row for '{text}' not found.");
    }

    private void WaitForAdjustModal()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h3[contains(.,'Adjust Stock')]"))
             .Any(e => e.Displayed));
    }

    private void WaitForAdjustModalClosed()
    {
        _wait.Until(d =>
            !d.FindElements(By.XPath("//h3[contains(.,'Adjust Stock')]"))
              .Any(e => e.Displayed));
    }
}
