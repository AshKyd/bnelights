const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const parser = new XMLParser();
module.exports = function parse(text) {
  let jObj = parser.parse(text);
  const item = jObj.rss.channel.item;
  return Array.isArray(item) ? item : [item];
};
