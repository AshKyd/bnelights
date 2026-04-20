import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  processEntities: {
    maxTotalExpansions: 50000,
  },
});

export default function parse(text) {
  const jObj = parser.parse(text);
  const item = jObj.rss.channel.item;
  return Array.isArray(item) ? item : [item];
}
