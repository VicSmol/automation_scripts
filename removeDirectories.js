#!/bin/env node

//TODO There's need to write description about this script

'use strict';

const fs = require('node:fs/promises');
const path = require('path');
const extractValue = require('./utils.js').extractValue;
const startDirectory = extractValue('--start-path');
const removableDirectory = extractValue('--remove-dir');

fs.readdir(startDirectory, {withFileTypes: true})
	.then(dirents => {
		const directories = dirents.filter(entity => entity.isDirectory());
		return Promise.all(directories.map(dirent => {
			const dirName = path.join(startDirectory, dirent.name, removableDirectory);
			return fs.rm(dirName, {recursive: true, force: true})
				.then(() => console.info(`INFO: Directory ${dirName} was removed`))
				.catch(error => console.error(`ERROR: Directory ${dirName} wasn't removed | ${error.message}`));
		}));
	})
	.catch(error => console.error(`Error while reading directory: ${error.message}`));
