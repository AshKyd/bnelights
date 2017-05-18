const listify = require('listify');
const l = arr => listify(arr, {finalWord: '&'});

function tweetGlamour(message){
  let status = message.mediumText.length > 140 ? message.shortText : message.mediumText;
  status = status.trim();
  status = status.replace(/\.$/, '');
  status = status.replace(/(\s\n\r)+/, ' ');
  if(status.length > 140) status = status.replace(/Bridge/g, 'Brdg');
  if(status.length > 140) status = status.replace(/lit up/g, 'lit');
  if(status.length > 140) status = status.replace(/Brisbane City Hall/g, 'City Hall');
  if(status.length > 140) status = status.replace(/King George Square/g, 'KGS');
  if(status.length > 140) status = status.replace(/to commemorate/g, 'for');
  if(status.length > 140) status = status.replace(/in recognition of/g, 'for');
  if(status.length > 140) status = status.replace(/and/g, '&');
  if(status.length > 140) status = status.replace(/Anniversary/g, 'anniv');
  if(status.length > 140) status = status.replace(/green/g, 'grn');
  if(status.length > 140) status = status.replace(/[Yy]ellow/g, 'yllw');
  if(status.length > 140) status = status.replace(/white/g, 'wht');
  const char = (['🌉', '🎆', '✨'])[Math.round(Math.random()*2)];
  if(status.includes('Bridge') && status.length < 138) status += (' ' + char);
  if(status.length > 140 && message.tinyText) return message.tinyText;
  status = status.substr(0,140);
  return status;
}

module.exports = function(event){

  if(event.venues.length === 1){
    const text = event.description.match(/(.*\n)/g)[0];
    const tweetText = tweetGlamour({shortText: text, mediumText: text});
    return{ shortText: text, mediumText: text, tweetText};
  }

  if(event.colors.length){
    const tinyText = `Tonight various venues will be lit ${l(event.colors)} for ${event.title}`;
    const shortText = `${event.title}: ${l(event.venues)} will be lit ${l(event.colors)}`;
    const mediumText = `Tonight ${l(event.venues)} will be lit up in ${l(event.colors)} for ${event.title}`;
    const tweetText = tweetGlamour({tinyText, shortText, mediumText});
    return {shortText, mediumText, tweetText};
  }

  console.log(event);
  throw new Error('idk');
}
