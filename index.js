const { readFile } = require("fs/promises");
const { join } = require("path");

const findClosingBracket = (tokens) => {
  let openBrackets = 0;
  for (const [i, token] of tokens.entries()) {
    if (token === "[") {
      openBrackets++;
    } else if (tokens[i] === "]") {
      openBrackets--;
      if (openBrackets === 0) {
        return i;
      }
    }
  }
  throw new Error("No closing bracket found");
};

const createNestedStack = (tokens) => {
  try {
    if (tokens.includes("[")) {
      const index = tokens.indexOf("[");
      const closingIndex = findClosingBracket(tokens);
      const innerTokens = tokens.slice(index + 1, closingIndex);
      const innerStack = createNestedStack(innerTokens);
      const rest = createNestedStack(tokens.slice(closingIndex + 1));
      return [...tokens.slice(0, index), innerStack, ...rest];
    }
    return tokens;
  } catch (error) {
    throw error;
  }
};

const asyncReadLine = async (question = "") => {
  const readline = require("node:readline");
  const { stdin: input, stdout: output } = require("node:process");
  const readLineInterface = readline.createInterface({ input, output });
  return new Promise((resolve, reject) => {
    readLineInterface.question(question, (answer) => {
      try {
        readLineInterface.close();
        resolve(answer);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const execute = async (command, array, $p) => {
  switch (command) {
    case "+":
      array[$p.value] = array[$p.value] + 1;
      break;
    case "-":
      array[$p.value] = array[$p.value] - 1;
      break;
    case ">":
      $p.value = $p.value + 1;
      break;
    case "<":
      $p.value = $p.value - 1;
      break;
    case ".":
      process.stdout.write(String.fromCharCode(array[$p.value]));
      break;
    case ",":
      const value = await asyncReadLine();
      array[$p.value] = value.charCodeAt(0);
      break;
    default:
      while (array[$p.value] !== 0) {
        for (const comm of command) {
          await execute(comm, array, $p);
        }
      }
      break;
  }
};

(async () => {
  try {
    const file = await readFile(join(__dirname, "sample.bf"), "utf8");
    const input = file.replace(/[^\+\-\>\<\.\,\[\]]/g, "");
    const array = new Uint8Array(30000).fill(0);
    const pointer = { value: 0 };
    const tokens = input.split("");
    const stack = createNestedStack(tokens);
    for (const token of stack) {
      await execute(token, array, pointer);
    }
  } catch (error) {
    console.log(error);
  }
})();
