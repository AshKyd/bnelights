const fs = require('fs');
const path = require('path');
const parse = require('../lib/parseFeed');
const assert = require('assert');
const cheerio = require('cheerio');
const getDay = require('../lib/getDay');
const parseDay = require('../lib/parseDay');
const messageDay = require('../lib/messageDay');

describe('feed parsing', function(){
  let parsed, error;
  before(function(done){
    const xml = fs.readFileSync(path.join(__dirname, './assets/feed.xml'), 'utf8');
    const $ = cheerio.load(xml, {
      xmlMode: true,
      decodeEntities: true
    });
    parse($, function(parseError, parseParsed){
      parsed = parseParsed;
      error = parseError;
      done();
      fs.writeFileSync('out.json', JSON.stringify(parsed,null,2))
    });
  });
  it('should parse a feed', () => assert.ifError(error));
  it('should have parsed more than 0 bridges', () => assert.ok(parsed.venues.length));

  describe('parseDay', function(){
    let oneEvent, twoEvents;
    before(function(){
      oneEvent = parseDay(parsed.days[1]);
      twoEvents = parseDay(parsed.days[2]);
      noEvents = parseDay(parsed.days[3]);
    });

    it('should parse a day with one event', () => assert.deepEqual(oneEvent.length, 1));
    it('should parse a day with two events', () => assert.deepEqual(twoEvents.length, 2));
    it('should parse colours correctly', function(){
      const parsed = parseDay({
        date: '2017-05-21T14:00:00.000Z',
        venues: [{
          venue: 'a',
          title: 'b',
          description: 'red'
        }, {
          venue: 'b',
          title: 'c',
          description: 'green and orange'
        }]
      });
      assert.deepEqual(parsed[0].colors, ['red']);
      assert.deepEqual(parsed[1].colors, ['orange', 'green']);
    });
  });

  describe('messageDay', function(){
    it('should work on everything', function(){
      parsed.days.forEach(function(day){
        const parsedDay = parseDay(day);
        parsedDay.forEach(function(event){
          const messages = messageDay(event);
          console.log(messages.tweetText);
        });
      });
    });

  });
})
