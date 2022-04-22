/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const newObj = {};

  Object.keys(obj).forEach((prop) => {
    if (!fields.includes(prop)) {
      newObj[prop] = obj[prop];
    }
  });

  return newObj;
};
