import { readFile } from 'fs/promises';

(async () => {
	const input = await readFile('01-input.txt', 'utf8');

	const elfes = input.split(/\n\r?\n\r?/);

	const elfTotals = elfes.map((elf) => {
		return elf.split(/\n\r?/).reduce((acc, current) => {
			return acc + Number(current);
		}, 0);
	});

	elfTotals.sort((a, b) => b - a);

	const max = elfTotals[0];

	console.log(`The elf carrying the most calories carries ${max} calories`);

	const maxThree = elfTotals.slice(0, 3);

	const total = maxThree.reduce((acc, current) => {
		return acc + current;
	}, 0);

	console.log(
		`The total calories carried by the three strongest elves is ${total} calories`,
	);
})();
