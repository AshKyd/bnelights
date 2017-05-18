const request = require('request');
const cheerio = require('cheerio');
const parseFeed = require('./parseFeed');
const url = 'http://www.trumba.com/calendars/light-up-brisbane.rss';
module.exports = function(callback){
  request(url, function(error, response, xml){
    if(error) return callback(error);
    const $ = cheerio.load(xml, {
      xmlMode: true,
      normalizeWhitespace: true,
    });
    parseFeed($, callback);
  });
}
