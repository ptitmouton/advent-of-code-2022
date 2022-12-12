import { readFile } from 'fs/promises';

const Direction = {
  Start: 'S',
  Down: 'D',
  Left: 'L',
  Right: 'R',
  Up: 'U',
};

const readCommands = async () => {
  const data = await readFile('09-input.txt', 'utf8');
  return data
    .split(/\r?\n/)
    .map(line => {
      const [direction, distance] = line.split(' ');
      return {
        direction,
        distance: Number(distance)
      }
    });
}

const moveHead = ([currentHeadX, currentHeadY], direction) => {
  switch (direction) {
    case Direction.Up:
      return [currentHeadX, currentHeadY - 1];
    case Direction.Right:
      return [currentHeadX + 1, currentHeadY];
    case Direction.Down:
      return [currentHeadX, currentHeadY + 1];
    case Direction.Left:
      return [currentHeadX - 1, currentHeadY];
  }
  throw new Error(`Unknown direction: ${direction}`);
}

const getDistance = (pointA, pointB) => {
  return Math.max(Math.abs(pointA[0] - pointB[0]), Math.abs(pointA[1] - pointB[1]));
}

const moveKnot = (tail, head) => {
  const [currentTailX, currentTailY] = tail;
  const [headX, headY] = head;

  if (getDistance(tail, head) < 2) {
    return tail;
  }

  if (getDistance(tail, head) === 3) {
    throw new Error(`Knots are too far apart: [${tail.join(':')}, ${head.join(':')}] -> ${getDistance(tail, head)}`);
  }

  if (Math.abs(currentTailX - headX) < Math.abs(currentTailY - headY)) {
    // divide by 2 to make half the distance to the head (head is 2 away so move tail 1)
    const Ydiff = (currentTailY - headY) / 2;
    return [headX, currentTailY - Ydiff];
  } else if (Math.abs(currentTailX - headX) > Math.abs(currentTailY - headY)) {
    const Xdiff = (currentTailX - headX) / 2;
    return [currentTailX - Xdiff, headY];
  } else {
    const Xdiff = (currentTailX - headX) / 2;
    const Ydiff = (currentTailY - headY) / 2;
    return [currentTailX - Xdiff, currentTailY - Ydiff];
  }
}

const createHistoryOfKnotMovements = (numberOfKnots, commands) => {
  const history = [{
    knots: Array(numberOfKnots).fill([0, 0]),
    command: { direction: Direction.Start, step: '1/1' }
  }];


  for (const command of commands) {
    for (let i = 0; i < command.distance; i++) {
      const currentState = history.at(-1);
      // first move the head
      const newKnots =
        [...currentState.knots.slice(0, -1), moveHead(currentState.knots.at(-1), command.direction)];
      for (let knotIndex = newKnots.length - 2; knotIndex >= 0; knotIndex--) {
        newKnots[knotIndex] = moveKnot(newKnots[knotIndex], newKnots[knotIndex + 1]);
      }
      history.push({
        knots: newKnots,
        command: {
          direction: command.direction,
          step: `${i + 1}/${command.distance}`
        }
      });
    }
  }

  return history;
}


const main = async () => {
  const commands = (await readCommands());

  const numberOfTailPositions = (history) =>
    history
      .map(({ knots }) => {
        const tail = knots.at(0);
        return `${tail[0]}:${tail[1]}`;
      })
      .filter((val, i, arr) => arr.indexOf(val) === i)
      .length;


  console.log('Part 1:');
  console.log('------');
  console.log(`Number of positions visited by Tail at least once: ${numberOfTailPositions(createHistoryOfKnotMovements(2, commands))}`);

  console.log('Part 2:');
  console.log('------');
  console.log(`Number of positions visited by Tail at least once: ${numberOfTailPositions(createHistoryOfKnotMovements(10, commands))}`);
}

main();
