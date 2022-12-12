import { readFile } from 'fs/promises';

const readGrid = async () => {
	const data = await readFile('08-input.txt', 'utf8');
	return data
		.split(/\r?\n/)
		.map((line) => line.split('').map((char) => ({ height: Number(char) })));
};

const getAllTrees = (grid) => {
	return grid.reduce((acc, row) => {
		return [...acc, ...row];
	}, []);
};

const getHeightOfTree = (grid, { x, y }) => {
	return grid[y][x].height;
};

const isEdge = (grid, { x, y }) => {
	const edgeData = {
		left: x === 0,
		top: y === 0,
		right: x === grid[0].length - 1,
		bottom: y === grid.length - 1,
	};
	return {
		...edgeData,
		onEdge: Object.values(edgeData).some(Boolean),
	};
};

const getVisibility = (grid, { x, y }) => {
	const height = getHeightOfTree(grid, { x, y });
	const edge = isEdge(grid, { x, y });
	if (edge.onEdge) {
		return {
			...edge,
			visible: true,
			visibleFromTop: edge.top,
			visibleFromBottom: edge.bottom,
			visibleFromLeft: edge.left,
			visibleFromRight: edge.right,
			visibleDistanceFromTop: edge.top ? 0 : Infinity,
			visibleDistanceFromBottom: edge.bottom ? 0 : Infinity,
			visibleDistanceFromLeft: edge.left ? 0 : Infinity,
			visibleDistanceFromRight: edge.right ? 0 : Infinity,
			scenicScore: 0,
		};
	}

	let visibleTop,
		visibleBottom,
		visibleLeft,
		visibleRight,
		visibleDistanceFromTop,
		visibleDistanceFromBottom,
		visibleDistanceFromLeft,
		visibleDistanceFromRight;
	for (let cursorX = x - 1; cursorX >= 0; cursorX--) {
		visibleDistanceFromLeft = x;
		if (getHeightOfTree(grid, { x: cursorX, y }) >= height) {
			visibleLeft = false;
			visibleDistanceFromLeft = x - cursorX;
			break;
		}
	}
	for (let cursorX = x + 1; cursorX < grid[y].length; cursorX++) {
		visibleDistanceFromRight = grid[y].length - x - 1;
		if (getHeightOfTree(grid, { x: cursorX, y }) >= height) {
			visibleRight = false;
			visibleDistanceFromRight = cursorX - x;
			break;
		}
	}
	visibleDistanceFromTop = y;
	for (let cursorY = y - 1; cursorY >= 0; cursorY--) {
		if (getHeightOfTree(grid, { x, y: cursorY }) >= height) {
			visibleTop = false;
			visibleDistanceFromTop = y - cursorY;
			break;
		}
	}
	visibleDistanceFromBottom = grid.length - y - 1;
	for (let cursorY = y + 1; cursorY < grid.length; cursorY++) {
		if (getHeightOfTree(grid, { x, y: cursorY }) >= height) {
			visibleBottom = false;
			visibleDistanceFromBottom = cursorY - y;
			break;
		}
	}
	return {
		...edge,
		visibleFromTop: visibleTop ?? true,
		visibleFromBottom: visibleBottom ?? true,
		visibleFromLeft: visibleLeft ?? true,
		visibleFromRight: visibleRight ?? true,
		visible:
			(visibleTop ?? true) ||
			(visibleBottom ?? true) ||
			(visibleLeft ?? true) ||
			(visibleRight ?? true),
		visibleDistanceFromTop,
		visibleDistanceFromBottom,
		visibleDistanceFromLeft,
		visibleDistanceFromRight,
		scenicScore:
			visibleDistanceFromTop *
			visibleDistanceFromBottom *
			visibleDistanceFromLeft *
			visibleDistanceFromRight,
	};
};

const main = async () => {
	const rawGrid = await readGrid();
	const grid = rawGrid.map((row, y) =>
		row.map(({ height }, x) => ({
			height,
			x,
			y,
			...getVisibility(rawGrid, { x, y }),
		})),
	);

	let visibleTrees = [];
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[y].length; x++) {
			const tree = grid[y][x];
			if (tree.visible) {
				visibleTrees.push({ x, y, ...tree });
			}
		}
	}

	console.log('Part 1:');
	console.log('------');
	console.log(
		`There are ${visibleTrees.length} trees visible from the outside.`,
	);

	console.log('');

	console.log('Part 2:');
	console.log('------');
	const bestTree = getAllTrees(grid)
		.sort((a, b) => b.scenicScore - a.scenicScore)
		.at(0);
	console.log(
		`The tree with the heighest scenig score is the tree at [${bestTree.x}, ${bestTree.y}]. It's height is ${bestTree.height} and is has an astounding scenic score of ${bestTree.scenicScore}.`,
	);
};

main();
