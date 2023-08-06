//TODO There's need to write description about this script

'use strict';

const fs = require('node:fs/promises');
const path = require('path');
const extractValue = require('./utils.js').extractValue;
const startDirectory = extractValue('--start-path');
const removableDirectory = extractValue('--remove-dir');

fs.readdir(startDirectory, {withFileTypes: true}).then(dirents => dirents.filter(entity => entity.isDirectory())
	.map(dirent => path.join(startDirectory, dirent.name, removableDirectory))
	.map((dirName, index) => fs.access(dirName)
		.then(() => fs.rm(dirName, {recursive: true, force: true})
			.then(() => console.info(`INFO: (${index}) Directory ${dirName} was removed`))
			.catch(error => console.error(`ERROR: (${index}) Directory ${dirName} wasn't removed | ${error.message}`)))
		.catch(error => console.error(`ERROR: (${index}) Directory ${dirName} wasn't removed | ${error.message}`))));
