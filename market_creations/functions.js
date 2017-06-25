'use strict';

const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

const menuUrl = "http://marketcreationscafe.com/lunch/cleveland-oh/"

module.exports.menu = (event, context, callback) => {

  request(menuUrl, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var data = getData(html);

      var message;
      var date = data.shift();
      if (isToday(date)) {
        message = data.join("\n\n");
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

    var $ = cheerio.load(html, { normalizeWhitespace: true });
    $("div[id='content'] article div").children().each(function(i, element) {
      var item = $(this).text();
      if (item.trim()) {
        data.push(item);
      }
    });

    return data;
  }

  function isToday(date) {
    var today = moment().tz("America/New_York").format('MM/DD/YY');

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
