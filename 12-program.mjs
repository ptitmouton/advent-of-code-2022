import { readFile } from 'fs/promises';

class Grid {
	#_rawData;
	constructor(rawData) {
		this.#_rawData = rawData;

		this.cells = this.#_rawData.split(/\r?\n/).map((line, y) =>
			line.split('').map((c, x) => {
				return new Grid.Cell(this, x, y, c);
			}),
		);
	}

	findCell(predicate) {
		for (const row of this.cells) {
			for (const cell of row) {
				if (predicate(cell)) {
					return cell;
				}
			}
		}
	}

	findCells(predicate) {
		let cells = [];
		for (const row of this.cells) {
			for (const cell of row) {
				if (predicate(cell)) {
					cells.push(cell);
				}
			}
		}
		return cells;
	}

	getCellAt(x, y) {
		return this.cells[y]?.[x] ?? null;
	}

	get width() {
		return this.cells[0].length;
	}

	get height() {
		return this.cells.length;
	}
}
Grid.fromPath = async (path) => {
	return new Grid(await readFile(path, 'utf8'));
};
Grid.Cell = class {
	#_grid;
	constructor(grid, x, y, value) {
		this.#_grid = grid;
		this.x = x;
		this.y = y;
		this.elevation = ['S', 'E'].includes(value)
			? null
			: value.charCodeAt(0) - 97;
		this.type = value === 'S' ? 'start' : value === 'E' ? 'end' : 'terrain';
	}

	canAccess(otherCell) {
		if (this.elevation === null || otherCell.elevation === null) {
			return true;
		}
		return this.elevation <= otherCell.elevation + 1;
	}

	neighbors() {
		return [
			[this.x - 1, this.y],
			[this.x + 1, this.y],
			[this.x, this.y - 1],
			[this.x, this.y + 1],
		]
			.map(([x, y]) => this.#_grid.getCellAt(x, y))
			.filter(Boolean);
	}

	toString() {
		return `(${this.x}:${this.y})`;
	}
};
Grid.PathFinder = class {
	#_start;
	#_target;
	#_distances = new Map();
	#_parents = new Map();
	#_visitCell(cell, distance, parent) {
		if (this.#_distances.has(cell) && this.#_distances.get(cell) <= distance) {
			return;
		}
		this.#_distances.set(cell, distance);
		this.#_parents.set(cell, parent);
		if (cell === this.#_target) {
			return;
		}
		for (const neighbor of cell.neighbors()) {
			if (neighbor.canAccess(cell)) {
				this.#_visitCell(neighbor, distance + 1, cell);
			}
		}
	}

	constructor(start, target) {
		if (start.grid !== target.grid) {
			throw new Error('Start and target must be on the same grid');
		}
		this.#_start = start;
		this.#_target = target;

		this.#_visitCell(this.#_start, 0, null);
	}

	getShortestPath() {
		const path = [];
		let cell = this.#_target;
		while (cell) {
			path.push(cell);
			cell = this.#_parents.get(cell);
		}
		return path.reverse();
	}
};

const main = async () => {
	const grid = await Grid.fromPath('12-input.txt');

	const startCell = grid.findCell((c) => c.type === 'start');
	const targetCell = grid.findCell((c) => c.type === 'end');
	const pathFinder = new Grid.PathFinder(startCell, targetCell);

	const shortestPath = pathFinder.getShortestPath();
	console.log('-------');
	console.log(
		`The shortest path between ${startCell} and ${targetCell} is ${
			shortestPath.length - 1
		} steps long.`,
	);

	const shortestConnection = grid
		.findCells((c) => c.type === 'start' || c.elevation === 0)
		.map((cell) => {
			const pathFinder = new Grid.PathFinder(cell, targetCell);
			const shortestPath = pathFinder.getShortestPath();
			return {
				cell,
				shortestPath,
				length: shortestPath.length - 1,
			};
		})
		.filter(({ length }) => length > 0)
		.sort((a, b) => a.length - b.length)
		.at(0);

	console.log('Part 2:');
	console.log('-------');
	console.log(
		'Searching for the shortest path. This could take a little while...',
	);
	console.log(
		`The shortest path between any a-level terrain and the target ${targetCell} leads from ${shortestConnection.cell} and is ${shortestConnection.length} steps long.`,
	);
};
main();
