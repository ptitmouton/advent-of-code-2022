import { readFile } from 'fs/promises';

const getRucksacks = async () => {
  const data = await readFile('03-input.txt', 'ascii');
  return data.split(/\n\r?/);
};

const getPriority = (item) => {
      return (/[a-z]/.test(item)) ?
        item.charCodeAt(0) - 96 :
        item.toLowerCase().charCodeAt(0) - 96 + 26;
};

const mainFirst = async () => {
  let totalPriorities = 0;
  for (const rucksack of await getRucksacks()) {
    const items = rucksack.split('');

    const compartments = [items.slice(0, items.length / 2), items.slice(items.length / 2)];

    const commonItem = compartments[0].find(item => compartments[1].includes(item));

    totalPriorities += getPriority(commonItem);
  }

  console.log({ totalPriorities });
}

const mainSecond = async () => {
  let totalPriorities = 0;
  const elfGroups = (await getRucksacks()).reduce((groups, rucksack) => {
    if (!groups.length || groups.at(-1).length === 3) {
      return [...groups, [rucksack]];
    }
    return [...groups.slice(0, -1), [...groups.at(-1), rucksack]];
  }, []);

  for (const elfGroup of elfGroups) {
    const commonBadge = elfGroup[0].split('').find(item => elfGroup[1].split('').includes(item) && elfGroup[2].split('').includes(item));

    totalPriorities += getPriority(commonBadge);
  }

  console.log({ totalPriorities });
}

const main = mainSecond;

main();
