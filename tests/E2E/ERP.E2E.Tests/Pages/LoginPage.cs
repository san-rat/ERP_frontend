using ERP.E2E.Tests.Config;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace ERP.E2E.Tests.Pages;

public sealed class LoginPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public LoginPage(IWebDriver driver)
    {
        _driver = driver;
        _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
    }

    public void Open()
    {
        _driver.Navigate().GoToUrl(TestSettings.FrontendBaseUrl);
        _wait.Until(d => d.FindElement(By.Id("username")).Displayed);
    }

    public void LoginAs(string username, string password)
    {
        _driver.FindElement(By.Id("username")).Clear();
        _driver.FindElement(By.Id("username")).SendKeys(username);

        _driver.FindElement(By.Id("password")).Clear();
        _driver.FindElement(By.Id("password")).SendKeys(password);

        _driver.FindElement(By.CssSelector("button[type='submit']")).Click();
    }

    /// <summary>
    /// Waits until the browser navigates away from the login page
    /// to either the admin dashboard or the employee overview.
    /// Supports both "Dashboard" (admin) and "Overview" (employee).
    /// </summary>
    public void WaitForDashboard()
    {
        // Wait until we're on a different page (URL no longer ends at root/login)
        _wait.Until(d =>
            d.PageSource.Contains("Dashboard") ||
            d.PageSource.Contains("Overview") ||
            d.PageSource.Contains("Product Catalog") ||
            d.PageSource.Contains("Inventory Monitor"));
    }

    public string GetApiError()
    {
        return _wait.Until(d => d.FindElement(By.CssSelector("[role='alert']"))).Text;
    }

    public bool IsLoginVisible()
    {
        return _driver.FindElement(By.Id("username")).Displayed;
    }
}
