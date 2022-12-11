import { readFile } from 'fs/promises';

const readStacks = async () => {
  const stackSection = (await readFile('05-input.txt', 'utf-8')).split(/\r?\n\r?\n/)[0];
  const stackLines = stackSection.split(/\r?\n/);

  const stackCount = Number(stackLines.at(-1).match(/(\d+)\s?$/)[1]);
  const stackValues = stackLines.slice(0, -1);

  const stacks =
    new Array(stackCount)
    .fill([])
    .map((_, i) => {
      const stack = [];
      for (const lineNumber of Array(stackLines.length - 1).fill(0).map((_, i) => i).reverse()) {
        const index = i === 0 ? 1 : i * 4 + 1
        const item = stackValues[lineNumber].charAt(index);
        if (/[A-Za-z]/.test(item)) {
          stack.push(item);
        }
      }
      return stack;
    });

  return stacks;

};

const readCommands = async () => {
  const commandLines = (await readFile('05-input.txt', 'utf-8')).split(/\r?\n\r?\n/)[1].split(/\r?\n/);
  return commandLines.map((line) => {
    const matches = line.match(/move (\d+) from (\d+) to (\d+)/);
    return {
      from: parseInt(matches[2]),
      to: parseInt(matches[3]),
      count: parseInt(matches[1]),
    };
  });
};

const main = async (crateMover) => {
  if (![9000, 9001].includes(crateMover)) {
    throw new Error('Invalid crate mover. Only CrateMover 9000 and 9001 are available.');
  }
  const stacks = await readStacks();
  const commands = await readCommands();

  for (const command of commands) {
    const { from, to, count } = command;
    if (crateMover === 9000) {
      for (let i = 0; i < count; i++) {
        stacks[to - 1].push(stacks[from - 1].pop());
      }
    } else {
      stacks[to - 1].push(...stacks[from - 1].splice(-count));
    }
  }

  console.log({ stacks });
  console.log({ tops: stacks.map((stack) => stack.at(-1)).join('') });
}

main(9001);
