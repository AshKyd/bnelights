/**
 * Join an array of strings into a human-readable list.
 * @param {string[]} list Array of strings to join
 * @param {object} options
 * @param {string} options.separator The separator between items (default: ", ")
 * @param {string} options.finalWord The word before the last item (default: "and")
 * @returns {string} The joined list
 */
export default function listify(list, { separator = ", ", finalWord = "and" } = {}) {
  if (!Array.isArray(list)) {
    throw new TypeError("requires an array");
  }

  const items = list.map((item) => item.trim()).filter(Boolean);

  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  // For exactly two items, join with the final word (e.g., "A and B")
  if (items.length === 2) {
    return items.join(finalWord ? ` ${finalWord} ` : separator);
  }

  // For three or more items, use the separator and the final word (e.g., "A, B, and C")
  const head = items.slice(0, -1).join(separator);
  const tail = items[items.length - 1];
  const junction = finalWord ? `${separator}${finalWord} ` : separator;

  return `${head}${junction}${tail}`;
}
