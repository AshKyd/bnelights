const path = require('path');
const Twitter = require('twitter');
const getFeed = require('./lib/feed');
const parseDay = require('./lib/parseDay');
const messageDay = require('./lib/messageDay');
const async = require('async');
const Moment = require('moment');

async.waterfall([
  (done) => getFeed(done),
  (parsedFeed, done) => {
    const now = Date.now();
    const today = parsedFeed.days.find(day => {
      if(now - day.date <= 24*60*60*1000){
        return day;
      }
    });
    if(!today) return done(new Error('Today not found!'));

    const todayReduced = parseDay(today);
    const messages = todayReduced.map(messageDay);
    done(null, messages);
  },
  (messages, done) => {
    var client = new Twitter(require(path.join(__dirname, 'secrets.json')));
    async.each(messages, function(message, doneTweeting){
      console.log('tweeting', message.tweetText);
      // client.post('statuses/update', {status: message.tweetText},  doneTweeting);
    }, done);
  }
], function(error){
  if(error) console.error(error);
  process.exit();
});
