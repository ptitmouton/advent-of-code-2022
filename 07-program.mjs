import { readFile } from 'fs/promises';

const TOTAL_SPACE = 70_000_000;
const SPACE_NEEDED = 30_000_000;

let fileTree = {
	name: '/',
	path: '/',
	type: 'd',
	children: [],
};

let currentWorkingDirectory = { path: '/', node: fileTree };

const changeCWD = (path) => {
	const normalizedPath =
		path === '/' ? '/' : path.replace(/\/$/, '').replace(/\/\//, '');
	const node = normalizedPath
		.split('/')
		.slice(1)
		.reduce((node, part) => {
			if (part === '') {
				return node;
			}
			const child = node.children.find((c) => c.name === part);
			if (!child) {
				throw new Error('No such directory: ' + part);
			}
			return child;
		}, fileTree);

	currentWorkingDirectory = { path, node };
};

const getNodeSize = (node, { disableSizeCache } = {}) => {
	if (node.size) {
		return node.size;
	}
	if (!node.children) {
		throw new Error('Node has no size and no children');
	}
	const size = node.children.reduce(
		(size, child) => size + getNodeSize(child),
		0,
	);
	if (!disableSizeCache) {
		node.size = size;
	}
	return size;
};

const parseCommand = (command) => {
	const [_, instruction, params] = command.match(/\$ (\w+)(?: (.*))?$/);
	return {
		instruction,
		params: params?.split(' ') ?? [],
		results: [],
	};
};

const readCommands = async () => {
	const lines = await readFile('07-input.txt', 'utf8');
	return lines.split(/\r?\n/).reduce((commands, line) => {
		if (line.startsWith('$')) {
			return [...commands, parseCommand(line)];
		} else {
			const last = commands.pop();
			return [...commands, { ...last, results: [...last.results, line] }];
		}
	}, []);
};

const generateFileTree = async () => {
	const commands = await readCommands();
	for (const command of commands) {
		const normalizedPath =
			currentWorkingDirectory.path === '/'
				? '/'
				: currentWorkingDirectory.path + '/';
		if (command.instruction === 'cd') {
			if (command.params[0].startsWith('/')) {
				changeCWD(command.params[0]);
			} else if (command.params[0] === '..') {
				if (currentWorkingDirectory.path === '/') {
					throw new Error('Cannot go up from root directory');
				}
				changeCWD(
					currentWorkingDirectory.path.split('/').slice(0, -1).join('/') || '/',
				);
			} else {
				changeCWD(normalizedPath + command.params[0]);
			}
		} else if (command.instruction === 'ls') {
			if (command.params.length) {
				throw new Error('Not implemented: ls params');
			}
			const items = command.results.map((line) => {
				const dirMatch = line.match(/^dir (.+)$/);
				const fileMatch = line.match(/^(\d+) (.+)$/);
				if (dirMatch) {
					return {
						name: dirMatch[1],
						type: 'd',
						path: normalizedPath + dirMatch[1],
						children: [],
					};
				} else if (fileMatch) {
					return {
						name: fileMatch[2],
						type: 'f',
						path: normalizedPath + fileMatch[2],
						size: parseInt(fileMatch[1]),
					};
				} else {
					throw new Error('Could not parse ls result: ' + line);
				}
			});

			const newItems = items.filter((item) => {
				// If a directory already exists, don't add it again
				// This is relevant primarily for the directories
				return !currentWorkingDirectory.node.children.find(
					(c) => c.name === item.name,
				);
			});
			currentWorkingDirectory.node.children = [
				...currentWorkingDirectory.node.children,
				...newItems,
			];
		}
	}
};

// Returns all nodes for which the callback returns true
// Callback is passed the node to check
const collectNodes = (callback, nodes = fileTree.children) => {
	const collected = [];
	for (const node of nodes) {
		if (callback(node)) {
			collected.push(node);
		}
		if (node.children) {
			collected.push(...collectNodes(callback, node.children));
		}
	}
	return collected;
};

const main = async () => {
	await generateFileTree();

	console.log('PART 1');
	console.log('------');

	const directoriesLowerThan100000 = collectNodes(
		(node) => node.type === 'd' && getNodeSize(node) <= 100000,
	);

	console.log('directories with size <= 100000:');
	console.log(
		directoriesLowerThan100000
			.map((d) => `- ${d.name} (Size: ${d.size})`)
			.join('\n'),
	);
	console.log(
		'With a total of: ' +
			directoriesLowerThan100000.reduce((size, d) => size + d.size, 0),
	);

	console.log('PART 2');
	console.log('------');

	const freeDiskSpace = TOTAL_SPACE - getNodeSize(fileTree);
	const missingDiskSpace = SPACE_NEEDED - freeDiskSpace;

	console.log('Free disk space: ' + freeDiskSpace);
	console.log('Missing space for update: ' + missingDiskSpace);

	const nodeToDelete = collectNodes(
		(node) => node.type === 'd' && getNodeSize(node) >= missingDiskSpace,
	)
		.sort((a, b) => getNodeSize(a) - getNodeSize(b))
		.at(0);
	console.log(
		`should delete directory: ${nodeToDelete.name} at path ${nodeToDelete.path} (Size: ${nodeToDelete.size})`,
	);
};

main();
