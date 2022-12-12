import { readFile } from 'fs/promises';

const readMonkeyNotes = async () => {
  const data = await readFile('11-input.txt', 'utf8');
  const monkeys = data.split(/\r?\n\r?\n/);
  return monkeys.map((monkey) => {
    const lines = monkey.split(/\r?\n/);
    const name = lines[0].replace(/:$/, '');

    const startingItems = lines[1].match(/(\d+)/g).map(Number);
    const operation = new Function('old', lines[2].match(/Operation: (.*)$/).at(1).replace('new = ', 'return '));
    const testMatches = lines[3].match(/(\d+)$/);
    const trueTarget = lines[4].match(/(\d+)$/).at(1);
    const falseTarget = lines[5].match(/(\d+)$/).at(1);
    const test = {
      operation: 'div', // because its always div
      argument: Number(testMatches.at(1)),
      targets: [falseTarget, trueTarget].map(Number)
    };

    return { name, startingItems, operation, test };
  });
}

const makeInitState = async () => {
  const monkeyNotes = await readMonkeyNotes();
  const initialState = {
    monkeys: monkeyNotes.map(({ name, startingItems }) => ({
      name,
      items: startingItems,
      itemsInspected: 0,
    })),
    originalNotes: monkeyNotes
  };
  return initialState;
};

const runRound = (state, { nervous }) => {
  // kleinster gemeinsamer Nenner, whatever it's called in english
  // makes angriness level keep ration but not letting it becoming too big,
  // it was even not manageable with BigInts on 1000 rounds
  const kgt = state.originalNotes
    .reduce((acc, monkey) => acc * monkey.test.argument, 1);

  for (let monkeyIndex = 0; monkeyIndex < state.originalNotes.length; monkeyIndex++) {
    const note = state.originalNotes[monkeyIndex];
    state.monkeys[monkeyIndex].items =
      state
        .monkeys
        .at(monkeyIndex)
        .items
        .filter((angerLevelBeginning) => {
          const angerLevelWhenMonkeyPlays = note.operation(angerLevelBeginning);
          const angerLevelAfterMonkeyPlays =
            (nervous
            ? angerLevelWhenMonkeyPlays
            : Math.floor(angerLevelWhenMonkeyPlays / 3)) % kgt;

          const testResult = (angerLevelAfterMonkeyPlays % note.test.argument) === 0;
          const target = note.test.targets[Number(testResult)];

          state.monkeys.at(target).items.push(angerLevelAfterMonkeyPlays);
          state.monkeys.at(monkeyIndex).itemsInspected++;
          return false;
        });
  }

  return state;
}

const playTheMonkeyGame = async ({ rounds, nervous }) => {
  const initialState = await makeInitState();

  let state = runRound(initialState, { nervous });
  for (let round = 1; round < rounds; round++) {
    state = runRound(state, { nervous });
  }

  return state;
}

const getMostActiveMonkeys = ({ monkeys }) => 
  monkeys.sort((a, b) => b.itemsInspected - a.itemsInspected).slice(0, 2);

const main = async () => {
  const mostActiveMonkeys = getMostActiveMonkeys(await playTheMonkeyGame({ rounds: 20, nervous: false }));
  console.log('Part 1:');
  console.log('-------');
  console.log('The most active monkeys were: ');
  mostActiveMonkeys.forEach((monkey) => {
    console.log(`- ${monkey.name} (${monkey.itemsInspected} items inspected)`);
  });
  console.log('which gives you a level of monkey business of ', mostActiveMonkeys.reduce((acc, monkey) => acc * monkey.itemsInspected, 1));
  console.log('');

  const mostActiveNervousMonkeys = getMostActiveMonkeys(
    await playTheMonkeyGame({ rounds: 10000, nervous: true })
  );
  console.log('Part 2:');
  console.log('-------');
  console.log('Becoming nervous?');
  console.log('The most active monkeys were: ');
  mostActiveNervousMonkeys.forEach((monkey) => {
    console.log(`- ${monkey.name} (${monkey.itemsInspected} items inspected)`);
  });
  console.log('which gives you an incredible level of monkey business of ', mostActiveNervousMonkeys.reduce((acc, monkey) => acc * monkey.itemsInspected, 1));
  console.log('');
}
main();
