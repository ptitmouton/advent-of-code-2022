import { readFile } from 'fs/promises';

const readPairs = async () => {
	const data = await readFile('04-input.txt', 'utf8');
	const lines = data.split(/\r?\n/);

	return lines.map((line) =>
		line.split(',').map((elf) => elf.split('-').map(Number)),
	);
};

const mainFirst = async () => {
	const pairsContainingEachOthers = (await readPairs()).filter((pair) => {
		if (
			(pair[0][0] >= pair[1][0] && pair[0][1] <= pair[1][1]) ||
			(pair[1][0] >= pair[0][0] && pair[1][1] <= pair[0][1])
		) {
			return true;
		}
		return false;
	});

	console.log({
		pairsContainingEachOthersCount: pairsContainingEachOthers.length,
	});
};

const mainSecond = async () => {
	const pairsOverlapping = (await readPairs()).filter((pair) => {
		const pairOneNumbers = new Array(pair[0][1] - pair[0][0] + 1)
			.fill(0)
			.map((_, i) => pair[0][0] + i);
		const pairTwoNumbers = new Array(pair[1][1] - pair[1][0] + 1)
			.fill(0)
			.map((_, i) => pair[1][0] + i);
		if (pairOneNumbers.some((number) => pairTwoNumbers.includes(number))) {
			return true;
		}
		return false;
	});

	console.dir({ pairsOverlappingCount: pairsOverlapping.length });
};

const main = mainSecond;
main();
