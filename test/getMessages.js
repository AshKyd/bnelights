const assert = require("assert");
const getMessages = require("../lib/getMessages");
const parseXml = require("../lib/parseXml");
const MockDate = require("mockDate");
const xmlTheQueen = parseXml(
  require("fs").readFileSync("./test/assets/feed-the-queen.rss", "utf8")
);
const xml2209 = parseXml(
  require("fs").readFileSync("./test/assets/2022-09-27.rss", "utf8")
);
const xml220929 = parseXml(
  require("fs").readFileSync("./test/assets/2022-09-29.rss", "utf8")
);

describe("getMessages", () => {
  before(() => MockDate.set(new Date("2022-09-10T00:00:00.000Z")));
  after(() => MockDate.reset());
  it("should parse a message when there's only one item", () => {
    const output = getMessages({ items: xmlTheQueen, targetSize: 500 });
    assert.deepEqual(output, [
      "Following the passing of Her Majesty, Queen Elizabeth II, Council assets will be lit in demure white.",
    ]);
  });

  describe("at a specific date", () => {
    before(() => MockDate.set(new Date("2022-09-27T07:28:31.844Z")));
    after(() => MockDate.reset());
    it("should return today's message", () => {
      const output = getMessages({ items: xml2209, targetSize: 500 });
      assert.deepEqual(output, [
        "Tonight landmarks around the city will be lit gold for Childhood Cancer Awareness Month 🎗️",
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
});
