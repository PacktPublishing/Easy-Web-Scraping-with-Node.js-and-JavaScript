const launchChrome = async () => {
  const puppeteer = require("puppeteer");

  const chromeDataDir = require("path").join(__dirname, "../chrome-data");

  // make sure chromeDataDir exists
  (() => {
    const { existsSync, mkdirSync } = require("fs");
    if (!existsSync(chromeDataDir)) mkdirSync(chromeDataDir);
  })();

  const args = [
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--lang=en-US,en",
    `--user-data-dir=${chromeDataDir}`,
  ];

  let chrome;
  try {
    chrome = await puppeteer.launch({
      headless: true, // run in headless mode
      devtools: false, // disable dev tools
      ignoreHTTPSErrors: true, // ignore https error
      args,
      ignoreDefaultArgs: ["--disable-extensions"],
    });
  } catch (e) {
    console.error("Unable to launch chrome", e);
    // return two functions to silent errors
    return [() => {}, () => {}];
  }

  const exitChrome = async () => {
    if (!chrome) return;
    try {
      await chrome.close();
    } catch (e) {}
  };

  const newPage = async () => {
    if (!chrome) return [];
    try {
      const page = await chrome.newPage();
      const closePage = async () => {
        if (!page) return;
        try {
          await page.close();
        } catch (e) {}
      };
      return [page, closePage];
    } catch (e) {
      console.error("Unable to create a new page");
      return [];
    }
  };

  return [newPage, exitChrome];
};

module.exports = { launchChrome };
