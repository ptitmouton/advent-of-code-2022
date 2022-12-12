import { readFile } from 'fs/promises';

const CRT__WIDTH = 40;
const CRT__HEIGHT = 6;

const ExecutionTime = {
  noop: 1,
  addx: 2,
};

const readCommands = async () => {
  const data = await readFile('10-input.txt', 'utf8');
  const lines = data.split(/\r?\n/);

  return lines.map((line) => {
    const [command, arg] = line.split(' ');

    const executionTime = ExecutionTime[command];
    if (!executionTime) {
      throw new Error(`Unknown command: ${command}`);
    }

    return {
      command,
      arg,
      executionTime,
    };
  })
}

const createMachine = (commands) => {
  return {
    commands: commands.map((command) => ({ ...command, cyclesRemaining: command.executionTime })),
    x: 1,
    elapsed: 1, // Yeah, the FIRST cycle is 1, as in english, not as in javascript. That got me.
  };
};

const updateRegisterValue = (currentValue, command) => {
  switch (command.command) {
    case 'noop':
      return currentValue;
    case 'addx':
      return currentValue + Number(command.arg);
  }
};

const runMachine = (machine) => {
  const currentCommand = machine.commands[0];
  const nextCommand = machine.commands.slice(1);
  currentCommand.cyclesRemaining -= 1;

  machine.elapsed += 1;
  if (currentCommand.cyclesRemaining === 0) {
    machine.x = updateRegisterValue(machine.x, currentCommand);
    machine.commands = nextCommand;
  } else {
    machine.commands = [currentCommand, ...nextCommand];
  }

  return machine;
}

const main = async () => {
  const screen =
    new Array(CRT__HEIGHT)
      .fill(0)
      .map(() => new Array(CRT__WIDTH).fill(' '));

  const commands = await readCommands();

  const signalStrengths = [];
  const machine = createMachine(commands);
  while (machine.commands.length > 0) {
    if ([20, 60, 100, 140, 180, 220].includes(machine.elapsed)) {
      signalStrengths.push(machine.x * machine.elapsed);
    }

    const screenCursorPosition = machine.elapsed - 1;
    const screenCursorRow = Math.floor(screenCursorPosition / CRT__WIDTH);
    const screenCursorColumn = screenCursorPosition % CRT__WIDTH;

    const activatedSpriteColumns = [machine.x - 1, machine.x, machine.x + 1];

    screen[screenCursorRow][screenCursorColumn] =
      activatedSpriteColumns.includes(screenCursorColumn) ? '#' : '.';

    runMachine(machine);

  }

  console.log('Part 1:');
  console.log('------');
  console.log({ signalStrengths });
  console.log(`The sum of the signal strengths is: ${signalStrengths.reduce((a, b) => a + b)}`);

  console.log('');

  console.log('Part 2:');
  console.log('------');
  console.log('This is the image drawn on the CRT:');
  console.log(screen.map((row) => row.join('')).join('\n'));

}

main();
