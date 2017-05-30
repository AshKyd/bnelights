const Moment = require('moment');
module.exports = function(parsedFeed, date, callback){
  const today = parsedFeed.days
    .filter(day => day.date < date)
    .reduce((prev, next) => {
      if(prev.date > next.date){
        return prev;
      } else {
        return next;
      }
    });
  if(!today) return callback(new Error('Today not found!'));
  callback(null, today);
}
