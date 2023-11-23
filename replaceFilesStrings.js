#!/bin/env node

//TODO append description

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const extractValue = require('./utils').extractValue;
const replacement = extractValue('--replacement');
const substitution = extractValue('--substitution');
const files = extractValue('--files')
	.replace(/[\[\]]/g, '')
	.split(',')
	.map(url => path.resolve(url.replace('~', process.env.HOME)));

try {
	files.forEach(async (path) => {
		fs.readFile(path, {encoding: 'utf-8'}, (err, data) => {
			if (err) {
				console.error(err);
			}

			const result = data.replace(new RegExp(replacement, 'gmu'), substitution);

			fs.writeFile(path, result, {encoding: 'utf-8'}, (err) => console.error(err));

			console.debug(`File ${path} was changed`);
		});
	});
} catch (error) {
	console.error(`ERROR: ${error.message}`);
	console.error(error);
}
