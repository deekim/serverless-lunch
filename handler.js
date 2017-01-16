'use strict';

const request = require('request');
const cheerio = require('cheerio');

const menuUrl = "http://marketcreationscafe.com/lunch/cleveland-oh/"

module.exports.menu = (event, context, callback) => {

  request(menuUrl, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var data = getData(html);

      var message;
      var date = data.shift();
      if (isToday(date)) {
        message = data.join("\n");
      } else {
        message = "Hang tight, it looks like today's menu hasn't been posted yet.";
      }

      callback(null, createResponse(message, event, 200));
    } else {
      callback(null, createResponse("Whoops. I couldn't retrieve the menu.", event, 500));
    }
  });

  function getData(html) {
    var data = [];

    var $ = cheerio.load(html);
    $('article div p').each(function(i, element) {
      var item = $(this).text();
      if (item.trim()) {
        data.push(item);
      }
    });

    return data;
  }

  function isToday(date) {
    var today = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });

    return (date === today);
  }

  function createResponse(message, event, code) {
    const response = {
          statusCode: code,
          body: JSON.stringify({
            message: message,
            input: event,
          }),
        };

    return response;
  }
};
