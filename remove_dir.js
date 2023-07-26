'use strict';

const fs = require('node:fs/promises');
const path = require('path');
const getValue = require('./utils.js').getValue;

const startDirectory = getValue('--start-path');
const removableDirectory = getValue('--remove-dir');
const removeUnlessDirectories = async () => {
	const directories = (await fs.readdir(startDirectory, {withFileTypes: true}))
		.filter(entity => entity.isDirectory())
		.map(dir => path.join(startDirectory, dir.name, removableDirectory));

	for (const dir of directories) {
		await fs.access(dir)
			.then(() => fs.rm(dir, {recursive: true, force: true})
				.then(() => console.info(`INFO: Directory ${dir} was removed`))
				.catch(error => console.error(`ERROR: Directory ${dir} wasn't removed | ${error.message}`)))
			.catch(error => console.error(`ERROR: Directory ${dir} wasn't removed | ${error.message}`));
	}
};

removeUnlessDirectories();
