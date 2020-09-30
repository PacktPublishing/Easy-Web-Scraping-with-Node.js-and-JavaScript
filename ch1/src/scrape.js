const peto = require("peto");
const cheerio = require("cheerio");
const fs = require("fs");

const origin = "https://www.amazon.com";
let page = 1;

const scrape = (url, maxPages = 10) => {
  console.log("Opening", url);
  // step 1
  return peto({ url })
    .then(({ statusCode, data, ...response }) => {
      // exit this function if url is not well loaded
      if (statusCode !== 200)
        return console.error("Could not open", url, response);

      console.log("Opened");

      // create an array that we push scraped products into
      let products = [];

      // step 2
      const $ = cheerio.load(data);

      // steps 3 and 4
      try {
        $("[data-asin]").each((i, elm) => {
          elm = $(elm);
          const title = elm.find("h2").text().trim();
          const price = elm.find(".a-price .a-offscreen").text().trim();
          const rating = elm.find(".a-icon-alt").text().trim();
          const reviews_count = elm
            .find('a[href$="#customerReviews"]')
            .text()
            .trim();
          if (title && rating)
            products.push({ title, price, rating, reviews_count });
        });

        // step 5
        const file = `gotten-data/products_${page}.json`;
        fs.writeFile(file, JSON.stringify(products), (err) => {
          if (err) return console.error("Unable to write to file", file, err);
          console.log("Products saved to file", file);
        });
        console.log("products", products);
      } catch (e) {
        console.error("Unable to get the categories at", url, e);
      }

      // step 6 (the recursive path)
      page++; // auto increment the value of page
      if (page > maxPages) return;

      const nextPageURL =
        $(".a-pagination .a-last a").attr("href") ||
        $("#pagnNextLink").attr("href");
      if (nextPageURL) return scrape(origin + nextPageURL, maxPages);

      console.log("No more pages to scrape");
    })
    .catch(console.error);
};

module.exports = scrape;
