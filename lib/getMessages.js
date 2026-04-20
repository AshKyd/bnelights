import he from "he";
import listify from "./listify.js";
import striptags from "striptags";

function l(items) {
  return listify(items, { finalWord: "&" });
}

function comparableDate(date) {
  // We're always in +10 here in Brisbane so there's no need to configure this
  return new Date(Number(new Date(date)) + 10 * 60 * 60 * 1000);
}

function isItToday(dateStart, dateEnd) {
  if (!dateStart || !dateEnd) {
    throw new Error(
      `Missing date ${!dateStart ? "start" : ""}${!dateStart && !dateEnd ? " & " : ""}${!dateEnd ? "end" : ""}`
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
  return isToday;
}

function sanitiseLocation(location) {
  return he.decode(location.split(",")[0]);
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
  const colorsWeighted = {};
  colours.forEach((colour) => {
    const indexOf = string.toLowerCase().indexOf(colour);
    if (indexOf !== -1) {
      colorsWeighted[colour] = indexOf;
    }
  });

  return Object.keys(colorsWeighted).sort((a, b) =>
    colorsWeighted[a] < colorsWeighted[b] ? 1 : -1
  );
}

function tweetGlamour(status, targetSize) {
  let s = status;
  if (s.length > targetSize) s = s.replace(/Bridge/g, "Brdg");
  if (s.length > targetSize) s = s.replace(/lit up/g, "lit");
  if (s.length > targetSize) s = s.replace(/Brisbane City Hall/g, "City Hall");
  if (s.length > targetSize) s = s.replace(/King George Square/g, "KGS");
  if (s.length > targetSize) s = s.replace(/to commemorate/g, "for");
  if (s.length > targetSize) s = s.replace(/in recognition of/g, "for");
  if (s.length > targetSize) s = s.replace(/and/g, "&");

  if (s.length < targetSize - 3) {
    const lowercaseStatus = s.toLowerCase();
    const char = ["🌉", "🎆", "✨"][Math.round(Math.random() * 2)];
    if (
      lowercaseStatus.includes("festival") ||
      lowercaseStatus.includes("celebrate")
    ) {
      s += ` ${char}`;
    }

    if (lowercaseStatus.includes("awareness")) {
      s += " 🎗️";
    }
  }
  return s;
}

function getMessage({ title, locations, colours, description }, targetSize) {
  if (locations.length === 1) {
    const lines = striptags(description).split("\n").filter(Boolean);
    return [lines[0], lines[1]].join("\n\n").trim();
  }

  if (colours.length === 0) {
    return null;
  }

  const tinyText = `Tonight various venues will be lit ${l(colours)} for ${title}`;
  const locationText =
    locations.length <= 4 ? l(locations) : "landmarks around the city";
  const shortText = `${title}: ${locationText} will be lit ${l(colours)}`;
  const mediumText = `Tonight ${locationText} will be lit ${l(colours)} for ${title}`;

  const messages = [mediumText, shortText, tinyText].map((msg) =>
    tweetGlamour(msg, targetSize)
  );

  return messages.find((msg) => msg.length <= targetSize);
}

export default function getMessages({ items, targetSize }) {
  const combinedItems = {};

  items
    .filter((item) => isItToday(item["xCal:dtstart"], item["xCal:dtend"]))
    .forEach((item) => {
      const title =
        Object.keys(combinedItems).find(
          (thisTitle) =>
            thisTitle.includes(item.title) || item.title.includes(thisTitle)
        ) || item.title;

      if (!combinedItems[title]) {
        combinedItems[title] = { title: he.decode(item.title), locations: [] };
      }

      combinedItems[title].locations.push(
        sanitiseLocation(item["xCal:location"])
      );
      combinedItems[title].colours = getColours(item.description);
      combinedItems[title].description = he.decode(item["xCal:description"]);
    });

  return Object.values(combinedItems).map((item) =>
    getMessage(item, targetSize)
  );
}
