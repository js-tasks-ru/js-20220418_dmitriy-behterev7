/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    let lastVal = { ...obj };

    path.split(".").forEach((el) => lastVal && (lastVal = lastVal[el]));

    return lastVal;
  };
}

// const product = {
//   category: {
//     title: "Goods",
//   },
// };
// const product = {};

// const getter = createGetter("nested.nested");

// console.log(getter(product)); // Goods
