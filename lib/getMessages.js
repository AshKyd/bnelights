const he = require("he");
const listify = require("./listify");
function l(items) {
  return listify(items, { finalWord: "&" });
}
function comparableDate(date) {
  // We're always in +10 here in Brisbane so there's no need to configure this
  return new Date(Number(new Date(date)) + 10 * 60 * 60 * 1000);
}
function isItToday(dateStart, dateEnd, event) {
  if (!dateStart || !dateEnd) {
    throw new Error(
      "Missing date " + dateStart ? (dateEnd ? "start & end" : "end") : "start"
    );
  }
  // 00:00
  const today = new Date();

  // The start of the event.
  const eventDayStart = comparableDate(new Date(dateStart));

  // The end of the event.
  const eventDayEnd = comparableDate(new Date(dateEnd));

  // Does today fall somewhere in the middle?
  const isToday = today >= eventDayStart && today <= eventDayEnd;
  if (event.includes("Gran")) {
    console.log(
      JSON.stringify(
        {
          event,
          today,
          eventDayStart,
          eventDayEnd,
          dateStart,
          dateEnd,
          isToday,
        },
        null,
        3
      )
    );
  }
  return isToday;
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
  "gold",
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
    const message = [lines[0], lines[1]].join("\n\n").trim();
    return message;
  }

  if (colours.length === 0) {
    return null;
  }

  const tinyText = `Tonight various venues will be lit ${l(
    colours
  )} for ${title}`;
  const locationText =
    locations.length <= 4 ? l(locations) : "landmarks around the city";
  const shortText = `${title}: ${locationText} will be lit ${l(colours)}`;
  const mediumText = `Tonight ${locationText} will be lit ${l(
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

module.exports = function getMessages({ items, targetSize }) {
  // Combine items by location
  const combinedItems = {};

  items
    // only today's items
    .filter((item) =>
      isItToday(item["xCal:dtstart"], item["xCal:dtend"], item.title)
    )
    // reduce them down by
    .forEach((item) => {
      const title =
        Object.keys(combinedItems).find(
          (thisTitle) =>
            thisTitle.includes(item.title) || item.title.includes(thisTitle)
        ) || item.title;

      if (!combinedItems[title]) {
        combinedItems[title] = { title: item.title, locations: [] };
      }

      combinedItems[title].locations.push(
        sanitiseLocation(item["xCal:location"])
      );
      combinedItems[title].colours = getColours(item.description);
      combinedItems[title].description = he.decode(item["xCal:description"]);
    });

  const returnVal = Object.values(combinedItems).map((item) =>
    getMessage(item, targetSize)
  );

  return returnVal;
};
