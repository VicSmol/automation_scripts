'use strict';

const {execSync} = require("node:child_process");

module.exports = {
	extractValue: (argumentName) => {
		const index = process.argv.indexOf(`${argumentName}`);

		return index > -1 ? process.argv[index + 1] : undefined;
	},

	/**
	 * Function to format the time based on the time difference from a given timestamp
	 * @param {number} creationTimestamp - The timestamp to calculate the time difference from
	 * @returns {string} - The formatted time in HH:MM format
	 */
	getTimeFormat: (creationTimestamp) => {
		const currentTime = Date.now();
		const timeDifference = currentTime - creationTimestamp;
		const hours = Math.floor(timeDifference / (1000 * 60 * 60));
		const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = minutes.toString().padStart(2, '0');

		return `${formattedHours}:${formattedMinutes}`;
	},

	/**
	 * A function that retrieves output sources from a command execution result, processes and formats the output.
	 *
	 * @return {string[]} an array of processed and formatted output sources
	 */
	getOutputSources: () => execSync(`pacmd list-sources | awk '/name:/'`, {encoding: 'utf-8'})
		.trim()
		.split('\n\t')
		.map(str => str.trim().split(':').at(1))
		.map(str => str.trim().slice(1, -1))
		.map(str => {
			const parts = str.split('.')

			if (parts[parts.length - 1].trim() === 'monitor') {
				parts.pop();
			}

			return parts.join('.');
		}),

	/**
	 * Retrieves the current output source using pacmd command.
	 *
	 * @returns {string} The name of the current output source.
	 */
	getCurrentOutputSource: () => execSync(`pacmd list-sinks | awk '/index:|name:/'`, {encoding: 'utf-8'})
		.trim()
		.split('  ')
		.map(str => str.trim().split('\n\t'))
		.filter(raw => raw[0][0] === '*')
		.map(raw => raw.at(1).trim())
		.map(str => str.split(':').at(1).trim().slice(1, -1))
		.at(0),
};
