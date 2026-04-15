using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

/// <summary>
/// Page Object for /admin/users (Staff Management).
/// Handles: user table, search, role and status filters, Add New User modal.
/// </summary>
public sealed class AdminUsersPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public AdminUsersPage(IWebDriver driver)
    {
        _driver = driver;
        _wait   = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    public void GoTo()
    {
        _driver.Navigate().GoToUrl("http://localhost:5173/admin/users");
        WaitForPageReady();
    }

    public void WaitForPageReady()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h1[contains(.,'Staff Management')]"))
             .Any(e => e.Displayed));
    }

    // ── Table ────────────────────────────────────────────────────────────────

    public bool HasUserRows() =>
        _driver.FindElements(By.CssSelector("table tbody tr")).Count > 0;

    /// <summary>Returns count of visible, non-empty rows (excludes skeleton rows).</summary>
    public int GetVisibleRowCount() =>
        _driver.FindElements(By.CssSelector("table tbody tr"))
               .Count(r => !string.IsNullOrWhiteSpace(r.Text));

    // ── Search ────────────────────────────────────────────────────────────────

    public void TypeInSearch(string query)
    {
        var input = _wait.Until(d =>
            d.FindElements(By.CssSelector("input[placeholder='Search by name or email...']"))
             .FirstOrDefault(e => e.Displayed));
        if (input is null) throw new Exception("Search input not found.");
        input.Clear();
        input.SendKeys(query);
    }

    // ── Filters ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Selects a value in the Role filter dropdown.
    /// Visible text options: "All Roles", "Employees", "Managers".
    /// </summary>
    public void SelectRoleFilter(string visibleText)
    {
        // Role filter is the first <select> on the page
        var selects = _wait.Until(d =>
        {
            var list = d.FindElements(By.CssSelector("select"))
                        .Where(s => s.Displayed)
                        .ToList();
            return list.Count >= 1 ? list : null;
        });
        if (selects is null) throw new Exception("Role filter select not found.");
        new SelectElement(selects[0]).SelectByText(visibleText);
    }

    /// <summary>
    /// Selects a value in the Status filter dropdown.
    /// Visible text options: "All Statuses", "Active", "Inactive".
    /// </summary>
    public void SelectStatusFilter(string visibleText)
    {
        // Status filter is the second <select> on the page
        var selects = _wait.Until(d =>
        {
            var list = d.FindElements(By.CssSelector("select"))
                        .Where(s => s.Displayed)
                        .ToList();
            return list.Count >= 2 ? list : null;
        });
        if (selects is null) throw new Exception("Status filter select not found.");
        new SelectElement(selects[1]).SelectByText(visibleText);
    }

    // ── Add New User Modal ────────────────────────────────────────────────────

    public void ClickAddNewUser()
    {
        var btn = _wait.Until(d =>
            d.FindElements(By.XPath("//button[contains(.,'Add New User')]"))
             .FirstOrDefault(e => e.Displayed && e.Enabled));
        if (btn is null) throw new Exception("'Add New User' button not found.");
        btn.Click();
        WaitForModal();
    }

    /// <summary>Modal heading when creating a user is "Add New Staff".</summary>
    public bool IsAddUserModalOpen() =>
        _driver.FindElements(By.XPath("//h2[contains(.,'Add New Staff')]"))
               .Any(e => e.Displayed);

    public void CloseAddUserModal()
    {
        var cancelBtn = _wait.Until(d =>
            d.FindElements(By.XPath("//button[normalize-space(text())='Cancel']"))
             .FirstOrDefault(e => e.Displayed));
        cancelBtn?.Click();
        _wait.Until(d => !IsAddUserModalOpen());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void WaitForModal()
    {
        _wait.Until(d =>
            d.FindElements(By.XPath("//h2[contains(.,'Add New Staff')]"))
             .Any(e => e.Displayed));
    }
}
