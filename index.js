const path = require('path');
const async = require('async');
const Moment = require('moment');
const Twitter = require('twitter');
const getFeed = require('./lib/feed');
const Mastodon = require('mastodon');
const parseDay = require('./lib/parseDay');
const messageDay = require('./lib/messageDay');
const isProd = process.env.NODE_ENV === 'production';
console.log({isProd})

async.auto({
  parsedFeed: (done) => getFeed(done),
  messages: ['parsedFeed', (results, done) => {
    const now = Date.now();
    const today = results.parsedFeed.days.find(day => {
      if(now - day.date <= 24*60*60*1000){
        return day;
      }
    });
    if(!today) return done(new Error('Today not found!'));

    const todayReduced = parseDay(today);
    const messages = todayReduced.map(messageDay);
    done(null, messages);
  }],
  twit: ['messages', (results, done) => {
    var client = new Twitter(require(path.join(__dirname, 'secrets.twitter.json')));
    async.each(results.messages, function(message, doneTweeting){
      console.log('tweeting', message.tweetText, isProd);
      if(isProd) client.post('statuses/update', {status: message.tweetText},  doneTweeting);
    }, done);
  }],
  masto: ['messages', (results, done) => {
    var client = new Mastodon(require(path.join(__dirname, 'secrets.mastodon.json')));
    async.each(results.messages, function(message, doneTweeting){
      console.log('tooting', message.tweetText, isProd);
      if(isProd) client.post('statuses', { status: message.tweetText }).then(resp => {
        doneTweeting();
      });
    }, done);
  }],
}, function(error){
  if(error) console.error(error);
  process.exit();
});
