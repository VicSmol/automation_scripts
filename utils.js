'use strict';

module.exports = {
	getValue: (argumentName) => {
		const index = process.argv.indexOf(`${argumentName}`);

		return index > -1 ? process.argv[index + 1] : undefined;
	}
};
