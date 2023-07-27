'use strict';

//TODO There's need to write description about this script

const fs = require('node:fs/promises');
const path = require('path');
const getValue = require('./utils.js').getValue;
const startDirectory = getValue('--start-path');
const removableDirectory = getValue('--remove-dir');
const removeUnlessDirectories = async () => {
	fs.readdir(startDirectory, {withFileTypes: true}).then(dirents => dirents.filter(entity => entity.isDirectory())
		.map(dirent => path.join(startDirectory, dirent.name, removableDirectory))
		.map((dirName, index) => fs.access(dirName)
			.then(() => fs.rm(dirName, {recursive: true, force: true})
				.then(() => console.info(`INFO: (${index}) Directory ${dirName} was removed`))
				.catch(error => console.error(`ERROR: (${index}) Directory ${dirName} wasn't removed | ${error.message}`)))
			.catch(error => console.error(`ERROR: (${index}) Directory ${dirName} wasn't removed | ${error.message}`))));
};

removeUnlessDirectories();
