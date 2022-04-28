/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const newArr = [];

  if (!Array.isArray(arr)) {
    return [];
  }

  arr.forEach((val) => {
    if (!newArr.includes(val)) {
      newArr.push(val);
    }
  });

  return newArr;
}

//uniq([1, 2, 2, 3, 1, 4]); // [1, 2, 3, 4]
//console.log(uniq(["a", "a", "b", "c", "c"])); // ['a', 'b', 'c']
