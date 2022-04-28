/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  const newObj = {};
  if (typeof obj === "object" && !Array.isArray(obj) && obj !== null) {
    Object.keys(obj).forEach((key) => (newObj[obj[key]] = key));
  } else {
    return undefined;
  }

  return newObj;
}

// const obj = { key: "value" };

// console.log(invertObj(obj)); // { value: 'key'}
