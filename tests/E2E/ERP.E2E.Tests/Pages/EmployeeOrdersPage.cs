using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /employee/orders.
/// Handles: order table, search, status filter, detail drawer, and cancel flow.
/// </summary>
public sealed class EmployeeOrdersPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public EmployeeOrdersPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/employee/orders");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        // "Order Management" heading confirms the page is fully rendered
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Order Management')]"))
             .Any(e => e.Displayed));
    }

    // ── Table ────────────────────────────────────────────────────────────────

    public bool HasOrderRows() =>
        _driver.FindElements(By.CssSelector("table tbody tr")).Count > 0;

    /// <summary>Click the first table row that contains the given text.</summary>
    public void ClickOrderRow(string orderIdOrCustomerId)
    {
        var row = WaitForRowContaining(orderIdOrCustomerId);
        row.Click();
        WaitForDrawer();
    }

    /// <summary>Click the very first row in the orders table.</summary>
    public void ClickFirstOrderRow()
    {
        var row = _wait.Until(d =>
            d.FindElements(By.CssSelector("table tbody tr"))
             .FirstOrDefault(r => r.Displayed));
        if (row is null) throw new Exception("No order rows found in the table.");
        row.Click();
        WaitForDrawer();
    }

    // ── Search & Filter ──────────────────────────────────────────────────────

    public void TypeInSearch(string query)
    {
        var input = _wait.Until(d =>
            d.FindElements(By.CssSelector("input[type='text']"))
             .FirstOrDefault(e => e.Displayed));
        if (input is null) throw new Exception("Search input not found.");
        input.Clear();
        input.SendKeys(query);
    }

    public void SelectStatusFilter(string visibleText)
    {
        var select = _wait.Until(d =>
            d.FindElements(By.CssSelector("select"))
             .FirstOrDefault(e => e.Displayed));
        if (select is null) throw new Exception("Status filter select not found.");
        new SelectElement(select).SelectByText(visibleText);
    }

    public int GetVisibleRowCount() =>
        _driver.FindElements(By.CssSelector("table tbody tr")).Count;

    // ── Order Detail Drawer ──────────────────────────────────────────────────

    public bool IsDrawerOpen() =>
        _driver.FindElements(By.XPath("//h3[contains(.,'Order Details')]"))
               .Any(e => e.Displayed);

    public void CloseDrawer()
    {
        // The X button is inside the drawer header
        var closeBtn = _wait.Until(d =>
            d.FindElements(By.CssSelector("button"))
             .FirstOrDefault(e => e.Displayed && e.GetAttribute("class")?.Contains("hover:text-gray-800") == true));
        closeBtn?.Click();
        _wait.Until(d => !IsDrawerOpen());
    }

    /// <summary>
    /// Within an open drawer, click a status-transition action button by label.
    /// E.g. "Start Processing", "Mark Shipped", "Mark Delivered".
    /// </summary>
    public void ClickActionButton(string label)
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.XPath($"//button[contains(.,'{label}')]"))
             .FirstOrDefault(e => e.Displayed && e.Enabled));
        if (btn is null) throw new Exception($"Action button '{label}' not found or not enabled.");
        btn.Click();
    }

    // ── Cancel Flow ──────────────────────────────────────────────────────────

    public void OpenCancelModal() => ClickActionButton("Cancel Order");

    public bool IsCancelModalOpen() =>
        _driver.FindElements(By.XPath("//h3[contains(.,'Cancel Order')]"))
               .Any(e => e.Displayed);

    public void EnterCancellationReason(string reason)
    {
        var ta = _wait.Until(d =>
            d.FindElements(By.CssSelector("textarea"))
             .FirstOrDefault(e => e.Displayed));
        if (ta is null) throw new Exception("Cancellation reason textarea not found.");
        ta.Clear();
        ta.SendKeys(reason);
    }

    public void ConfirmCancel()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.XPath("//button[contains(.,'Confirm Cancel')]"))
             .FirstOrDefault(e => e.Displayed && e.Enabled));
        if (btn is null) throw new Exception("'Confirm Cancel' button not found or disabled.");
        btn.Click();
        _wait.Until(d => !IsCancelModalOpen());
    }

    public void GoBackFromCancelModal()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.XPath("//button[contains(.,'Go Back')]"))
             .FirstOrDefault(e => e.Displayed));
        btn?.Click();
        _wait.Until(d => !IsCancelModalOpen());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private IWebElement WaitForRowContaining(string text)
    {
        return _wait.Until(d =>
        {
            var rows = d.FindElements(By.CssSelector("table tbody tr"));
            return rows.FirstOrDefault(r =>
                r.Text.Contains(text, StringComparison.OrdinalIgnoreCase));
        }) ?? throw new Exception($"Order row containing '{text}' not found.");
    }

    private void WaitForDrawer()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h3[contains(.,'Order Details')]"))
             .Any(e => e.Displayed));
    }
}
