import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import MockDate from "mockdate";
import getMessages from "../lib/getMessages.js";
import parseXml from "../lib/parseXml.js";

const __dirname = import.meta.dirname;

const xmlTheQueen = parseXml(
  fs.readFileSync(path.join(__dirname, "assets/feed-the-queen.rss"), "utf8")
);
const xml2209 = parseXml(
  fs.readFileSync(path.join(__dirname, "assets/2022-09-27.rss"), "utf8")
);
const xml220929 = parseXml(
  fs.readFileSync(path.join(__dirname, "assets/2022-09-29.rss"), "utf8")
);
const htmlEntities = parseXml(
  fs.readFileSync(path.join(__dirname, "assets/htmlentities.rss"), "utf8")
);

describe("getMessages", () => {
  before(() => MockDate.set(new Date("2022-09-10T00:00:00.000Z")));
  after(() => MockDate.reset());

  it("should parse a message when there's only one item", () => {
    const output = getMessages({ items: xmlTheQueen, targetSize: 500 });
    assert.deepEqual(output, [
      "Following the passing of Her Majesty, Qüeen Elizabeth II, Council assets will be lit in demure white.",
    ]);
  });

  describe("at a specific date + should decode html entities", () => {
    before(() => MockDate.set(new Date("2022-09-27T07:28:31.844Z")));
    after(() => MockDate.reset());
    it("should return today's message", () => {
      const output = getMessages({ items: xml2209, targetSize: 500 });
      assert.deepEqual(output, [
        "Tonight landmarks around the city will be lit gold for Childhood Cancer & Awareness Month 🎗️",
      ]);
    });
  });

  describe("at a specific date", () => {
    before(() => MockDate.set(new Date(1664434817832)));
    after(() => MockDate.reset());
    it("should return today's message", () => {
      const output = getMessages({ items: xml220929, targetSize: 500 });
      assert.deepEqual(output, [
        "Tonight landmarks around the city will be lit white & blue for National Police Remembrance Day",
      ]);
    });
  });

  describe("with html tags", () => {
    before(() => MockDate.set(new Date("2023-10-21T07:28:31.844Z")));
    after(() => MockDate.reset());
    it("should return today's message", () => {
      const output = getMessages({ items: htmlEntities, targetSize: 500 });
      assert.deepEqual(output, [
        "City Hall will be lit Blue and Yellow to celebrate an event being held in City Hall.\n\nThis Light Up is organised by: JCI",
        "Tonight Victoria Bridge, Reddacliff Place, & Story Bridge will be lit blue for Mental Health Awareness Month - Beyond Blues' Big Blue Table 🎗️",
      ]);
    });
  });
});
