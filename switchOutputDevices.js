#!/bin/env node

//TODO There's need to write description about this script

'use strict';

const {execSync} = require('node:child_process');
const {extractValue, getOutputSources, getCurrentOutputSource} = require("./utils");
const isReverseOrder = JSON.parse(extractValue('--reverse-order'));
const command = 'pacmd set-default-sink';
const outputSources = getOutputSources();
const currentSource = getCurrentOutputSource();

try {
	let index = outputSources.findIndex((source) => source === currentSource);
	const diff = isReverseOrder ? -1 : 1;
	let nextIndex = (index + diff + outputSources.length) % outputSources.length;
	let commandOutput = execSync(`pacmd set-default-sink ${outputSources[nextIndex]}`, {encoding: 'utf-8'}).trim();
	let count = 1;

	while (commandOutput === `Sink ${outputSources[nextIndex]} does not exist.` && count <= outputSources.length) {
		nextIndex = (nextIndex + diff + outputSources.length) % outputSources.length;
		commandOutput = execSync(`${command} ${outputSources[nextIndex]}`, {encoding: 'utf-8'}).trim();
		count++;
	}
} catch (error) {
	console.error(`ERROR: ${error.message}`);
	console.error(error);
	process.exit(1);
}

process.exit(0);
