import { readFile } from 'fs/promises';

const OpponentValue = {
    Rock: 'A',
    Paper: 'B',
    Scissor: 'C',
};

const PlayerValue = {
    Rock: 'X',
    Paper: 'Y',
    Scissor: 'Z',
};

const RoundPoints = {
    [PlayerValue.Rock]: 1,
    [PlayerValue.Paper]: 2,
    [PlayerValue.Scissor]: 3,
};

const GamePoints = {
    Win: 6,
    Draw: 3,
    Lose: 0,
};

const NeedsTo = {
  Win: 'Z',
  Draw: 'Y',
  Lose: 'X',
};

const getRounds = async () => {
    const file = await readFile('02-input.txt', 'utf-8');
    return file.split(/\n\r?/);
};

const mainFirst = async () => {
    const rounds = await getRounds();
    let totalPoints = 0;
    for (const round of rounds) {
      const [opponentValue, playerValue] = round.split(' ');

      let roundPoints = 0;

      roundPoints += RoundPoints[playerValue];

      if (
        (playerValue === PlayerValue.Rock && opponentValue === OpponentValue.Rock)
        || (playerValue === PlayerValue.Paper && opponentValue === OpponentValue.Paper)
        || (playerValue === PlayerValue.Scissor && opponentValue === OpponentValue.Scissor)
      ) {
        roundPoints += GamePoints.Draw;
      } else {
        if (playerValue === PlayerValue.Rock) {
          roundPoints += opponentValue === OpponentValue.Scissor ? GamePoints.Win : GamePoints.Lose;
        }
        if (playerValue === PlayerValue.Paper) {
          roundPoints += opponentValue === OpponentValue.Rock ? GamePoints.Win : GamePoints.Lose;
        }
        if (playerValue === PlayerValue.Scissor) {
          roundPoints += opponentValue === OpponentValue.Paper ? GamePoints.Win : GamePoints.Lose;
        }
      }

      totalPoints += roundPoints;

    }

    console.log(`Total points: ${totalPoints}`);

}

const mainSecond = async () => {
    const rounds = await getRounds();

    let totalPoints = 0;
    for (const round of rounds) {
      const [opponentValue, needsValue] = round.split(' ');

      let playerValue = 0;
      if (opponentValue === OpponentValue.Rock) {
        if (needsValue === NeedsTo.Draw) {
          playerValue = PlayerValue.Rock;
        }
        if (needsValue === NeedsTo.Win) {
          playerValue = PlayerValue.Paper;
        }
        if (needsValue === NeedsTo.Lose) {
          playerValue = PlayerValue.Scissor;
        }
      }
      if (opponentValue === OpponentValue.Paper) {
        if (needsValue === NeedsTo.Draw) {
          playerValue = PlayerValue.Paper;
        }
        if (needsValue === NeedsTo.Win) {
          playerValue = PlayerValue.Scissor;
        }
        if (needsValue === NeedsTo.Lose) {
          playerValue = PlayerValue.Rock;
        }
      }
      if (opponentValue === OpponentValue.Scissor) {
        if (needsValue === NeedsTo.Draw) {
          playerValue = PlayerValue.Scissor;
        }
        if (needsValue === NeedsTo.Win) {
          playerValue = PlayerValue.Rock;
        }
        if (needsValue === NeedsTo.Lose) {
          playerValue = PlayerValue.Paper;
        }
      }

      let roundPoints = 0;

      roundPoints += RoundPoints[playerValue];

      if (
        (playerValue === PlayerValue.Rock && opponentValue === OpponentValue.Rock)
        || (playerValue === PlayerValue.Paper && opponentValue === OpponentValue.Paper)
        || (playerValue === PlayerValue.Scissor && opponentValue === OpponentValue.Scissor)
      ) {
        roundPoints += GamePoints.Draw;
      } else {
        if (playerValue === PlayerValue.Rock) {
          roundPoints += opponentValue === OpponentValue.Scissor ? GamePoints.Win : GamePoints.Lose;
        }
        if (playerValue === PlayerValue.Paper) {
          roundPoints += opponentValue === OpponentValue.Rock ? GamePoints.Win : GamePoints.Lose;
        }
        if (playerValue === PlayerValue.Scissor) {
          roundPoints += opponentValue === OpponentValue.Paper ? GamePoints.Win : GamePoints.Lose;
        }
      }

      totalPoints += roundPoints;

    }

    console.log(`Total points: ${totalPoints}`);

}

const main = mainSecond;

main();
