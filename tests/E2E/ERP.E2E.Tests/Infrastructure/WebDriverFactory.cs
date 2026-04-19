using ERP.E2E.Tests.Config;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace ERP.E2E.Tests.Infrastructure;

public static class WebDriverFactory
{
    public static IWebDriver Create()
    {
        var options = new ChromeOptions();

        // Use Brave if installed, otherwise fall back to Chrome
        var bravePath = @"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe";
        if (File.Exists(bravePath))
            options.BinaryLocation = bravePath;

        options.AddArgument("--window-size=1440,1024");

        if (TestSettings.Headless)
        {
            options.AddArgument("--headless=new");
            options.AddArgument("--disable-gpu");
        }

        return new ChromeDriver(options);
    }
}
