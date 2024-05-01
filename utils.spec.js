const assert = require('assert');
const {extractValue} = require("./utils");

process.argv = [
	'node',
	'script.js',
	'--name',
	'Alice',
	'--age',
	'30'
];
assert.strictEqual(extractValue('--name'), 'Alice');
assert.strictEqual(extractValue('--age'), '30');
assert.strictEqual(extractValue('--unknown'), undefined);

console.log('All tests passed successfully.');
