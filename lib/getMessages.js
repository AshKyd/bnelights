const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const he = require("he");
const parser = new XMLParser();
const listify = require("./listify");
function l(items) {
  return listify(items, { finalWord: "&" });
}
function comparableDate(date) {
  return [date.getFullYear(), date.getMonth(), date.getDate()]
    .map((num) => String(num).padStart(2, "0"))
    .join("-");
}
function isItToday(dateStart, dateEnd) {
  if (!dateStart || !dateEnd) {
    throw new Error(
      "Missing date " + dateStart ? (dateEnd ? "start & end" : "end") : "start"
    );
  }
  // 00:00
  const todayStart = comparableDate(new Date());
  // 11:59:59
  const todayEnd = comparableDate(
    new Date(Number(new Date(todayStart)) + 1000 * 60 * 60 * 24 - 1000)
  );

  // The start of the event.
  const eventDayStart = comparableDate(new Date(dateStart));

  // The end of the event.
  const eventdayEnd = comparableDate(new Date(dateEnd));

  // Does today fall somewhere in the middle?
  return todayStart >= eventDayStart && todayEnd <= eventdayEnd;
}

function sanitiseLocation(location) {
  return location.split(",")[0];
}

const colours = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "white",
  "black",
  "maroon",
];
function getColours(string) {
  const lowerString = string;
  const colorsWeighted = {};
  colours.forEach(function (colour) {
    const indexOf = lowerString.toLowerCase().indexOf(colour);
    if (indexOf !== -1) {
      colorsWeighted[colour] = indexOf;
    }
  });
  let colorsSorted = Object.keys(colorsWeighted);
  colorsSorted.sort(function (a, b) {
    if (colorsWeighted[a] < colorsWeighted[b]) {
      return 1;
    } else {
      return -1;
    }
  });

  return colorsSorted;
}

function tweetGlamour(status, targetSize) {
  if (status.length > targetSize) status = status.replace(/Bridge/g, "Brdg");
  if (status.length > targetSize) status = status.replace(/lit up/g, "lit");
  if (status.length > targetSize)
    status = status.replace(/Brisbane City Hall/g, "City Hall");
  if (status.length > targetSize)
    status = status.replace(/King George Square/g, "KGS");
  if (status.length > targetSize)
    status = status.replace(/to commemorate/g, "for");
  if (status.length > targetSize)
    status = status.replace(/in recognition of/g, "for");
  if (status.length > targetSize) status = status.replace(/and/g, "&");
  if (status.length < targetSize - 3) {
    const lowercaseStatus = status.toLowerCase();
    const char = ["🌉", "🎆", "✨"][Math.round(Math.random() * 2)];
    if (
      lowercaseStatus.includes("festival") ||
      lowercaseStatus.includes("celebrate")
    ) {
      status += " " + char;
    }

    if (lowercaseStatus.includes("awareness")) {
      status += " 🎗️";
    }
  }
  return status;
}

function getShortDescription(description) {
  return (description.split("\n").filter(Boolean)[1] || "").replace(
    /\..*/,
    "."
  );
}

function getMessage({ title, locations, colours, description }, targetSize) {
  if (locations.length === 1) {
    const lines = description.split("\n").filter(Boolean);
    return [lines[0], lines[1]].join("\n\n");
  }

  if (colours.length === 0) {
    return null;
  }

  if (colours.length) {
    const tinyText = `Tonight various venues will be lit ${l(
      colours
    )} for ${title}`;
    const shortText = `${title}: ${l(locations)} will be lit ${l(colours)}`;
    const mediumText = `Tonight ${l(locations)} will be lit ${l(
      colours
    )} for ${title}`;

    // Get the second line of the calendar text. This is usually an explainer of the charity.
    // const additionalMessage = getShortDescription(description);

    // generate some possible message candidates
    const messages = [mediumText, shortText, tinyText].map((message) =>
      tweetGlamour(message, targetSize)
    );

    const messageThatFits = messages.find(
      (message) => message.length <= targetSize
    );

    return messageThatFits;
  }
}

module.exports = async function getMessages({ targetSize }) {
  const XMLData = await fetch(
    "http://www.trumba.com/calendars/light-up-brisbane.rss"
  ).then((res) => res.text());

  // const XMLData = require("fs").readFileSync(
  //   "./test/assets/feed-the-queen.rss",
  //   "utf8"
  // );
  let jObj = parser.parse(XMLData);
  const item = jObj.rss.channel.item;
  const items = Array.isArray(item) ? item : [item];

  // Combine items by location
  const combinedItems = {};

  items
    // only today's items
    .filter((item) => isItToday(item["xCal:dtstart"], item["xCal:dtend"]))
    // reduce them down by
    .forEach((item) => {
      if (!combinedItems[item.title]) {
        combinedItems[item.title] = { title: item.title, locations: [] };
      }

      combinedItems[item.title].locations.push(
        sanitiseLocation(item["xCal:location"])
      );
      combinedItems[item.title].colours = getColours(item.description);
      combinedItems[item.title].description = he.decode(
        item["xCal:description"]
      );
    });

  return Object.values(combinedItems).map((item) => getMessage(item, 500));
};
