const assert = require('assert');
const {extractValue, getTimeFormat} = require("./utils");

process.argv = [
	'node',
	'script.js',
	'--name',
	'Alice',
	'--age',
	'30'
];

// Test extractValue function
function testExtractValue() {
	assert.strictEqual(extractValue('--name'), 'Alice');
	assert.strictEqual(extractValue('--age'), '30');
	assert.strictEqual(extractValue('--unknown'), undefined);
}

// Test getTimeFormat function with the first test case
function testFirstTimeFormatCase() {
	const testCase = {
		creationTimestamp: Date.now() - (60 * 60 * 1000) - (30 * 60 * 1000), expectedOutput: '01:30'
	};
	const result = getTimeFormat(testCase.creationTimestamp);
	assert.strictEqual(result, testCase.expectedOutput, 'First Time Format Test Case failed');
}

// Test getTimeFormat function with the second test case
function testSecondTimeFormatCase() {
	const testCase = {
		creationTimestamp: Date.now() - (2 * 60 * 60 * 1000) - (15 * 60 * 1000), expectedOutput: '02:16' // 02:15 is truth value
	};
	const result = getTimeFormat(testCase.creationTimestamp);
	assert.notStrictEqual(result, testCase.expectedOutput, 'Second Time Format Test Case failed');
}

testExtractValue();
testFirstTimeFormatCase();
testSecondTimeFormatCase();

console.log('All tests passed successfully.');
