module.exports = function(parsedFeed, date, callback){
  const today = parsedFeed.days.find(day => {
    if(date - day.date <= 24*60*60*1000){
      return day;
    }
  });
  if(!today) return callback(new Error('Today not found!'));
  callback(null, today);
}
