import { readFile } from 'fs/promises';

const getSignals = async () => {
	return (await readFile('06-input.txt', 'utf8')).split('');
};

const main = async (lengthOfMarker) => {
	const signals = await getSignals();
	let signalIndex;
	for (let i = lengthOfMarker; i < signals.length - lengthOfMarker; i++) {
		const seq = signals.slice(i - lengthOfMarker, i);
		if (!seq.find((s, i) => seq.find((s2, i2) => i !== i2 && s === s2))) {
			signalIndex = i;
			break;
		}
	}

	if (!signalIndex) {
		console.log('No signal found');
	}

	console.log({
		signalIndex,
		sequence: signals.slice(signalIndex - lengthOfMarker, signalIndex),
	});
};

// first part: lengthOfMarker = 4
// second part: lengthOfMarker = 14
main(14);
