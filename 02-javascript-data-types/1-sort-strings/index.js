/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  if (!Array.isArray(arr)) {
    throw Error("The first argument should be an array!");
  }

  const newArr = [...arr];

  return newArr.sort((a, b) => {
    if (param === "asc") {
      return a.localeCompare(b, ["ru", "en"], {
        caseFirst: "upper",
      });
    } else {
      return b.localeCompare(a, ["ru", "en"], {
        caseFirst: "upper",
      });
    }
  });
}
