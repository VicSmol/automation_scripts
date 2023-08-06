'use strict';

module.exports = {
	extractValue: (argumentName) => {
		const index = process.argv.indexOf(`${argumentName}`);

		return index > -1 ? process.argv[index + 1] : undefined;
	}
};
