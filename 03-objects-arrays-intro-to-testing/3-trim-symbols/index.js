/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let newStr = [];

  if (size === 0) {
    return "";
  } else if (!size) {
    return string;
  }

  let counter = 0;
  let previousLetter = "";
  string.split("").forEach((letter) => {
    if (letter !== previousLetter) {
      counter = 0;
    }

    if (counter < size) {
      newStr.push(letter);
    }

    counter++;
    previousLetter = letter;
  });

  return newStr.join("");
}

// console.log(trimSymbols("accbbdd", 0));
