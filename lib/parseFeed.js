const he = require('he');
module.exports = function($, callback){
  const venues = new Set();
  const dates = {};

  $('channel > item').each(function(i){
    const venue = $(this).find('xCal\\:location').text().trim().replace(/,.*/,'');
    const title = he.decode($(this).find('title').text().trim());
    const description = he.decode($(this).find('xCal\\:description').text().trim().replace(/&nbsp;/, ' '));
    const dateString = $(this).find('xCal\\:dtstart').text();
    const date = new Date(dateString);

    if(!venue) return console.error('invalid venue at item', i, dateString)
    if(isNaN(date.getTime())) return console.error('Invalid date for', venue, dateString);

    venues.add(venue);
    if(!dates[date]) dates[date] = {date, venues: []};

    dates[date].venues.push({
      venue,
      title,
      description,
    });
  });

  const days = Object.keys(dates).map(key => dates[key]);

  callback(null, {
    days,
    venues: Array.from(venues),
  });
}
