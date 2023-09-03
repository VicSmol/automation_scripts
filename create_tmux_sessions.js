#!/bin/env node

//TODO append description

'use strict';

const fs = require('node:fs');
const {execSync} = require('node:child_process');
const extractValue = require('./utils').extractValue;
const configPath = extractValue('--session-config');
const encodingOption = {encoding: 'utf-8'};
const orientation = {'vertical': '-h', 'horizontal': ''};

try {
	/** @type {
	 * {
	 *   name: string,
	 *   windows: {
	 *     number: number,
	 *     panes: {
	 *       number: number,
	 *       commands: string[],
	 *       splits: {
	 *         orientation: string
	 *       }[]
	 *     }[]
	 *   }[]
	 * }[]
 }
	 * */
	const sessionConfig = JSON.parse(fs.readFileSync(configPath, encodingOption));
	const desiredSessions = sessionConfig.map(session => session.name);

	execSync('tmux ls | awk \'{ print $1 }\'', encodingOption)
		.split('\n')
		.filter(session => session)
		.map(session => session.replace(':', ''))
		.filter(session => desiredSessions.includes(session))
		.forEach(session => {
			execSync(`tmux kill-session -t ${session}`, encodingOption);
		});

	sessionConfig.forEach(session => {
		execSync(`tmux new -d -s ${session.name}`, encodingOption);

		session.windows.forEach(window => {
			window.panes.forEach(pane => {
				pane.splits.forEach(split => {
					execSync(`tmux split-window ${orientation[split.orientation]} -t ${session.name}:${window.number}.${pane.number}`, encodingOption);
				});
				pane.commands.forEach(command => {
					execSync(`tmux send -t ${session.name}:${window.number}.${pane.number} "${command}" ENTER`, encodingOption);
				});
			});
		});
	});

	process.exit(0);
} catch (error) {
	console.error(`ERROR: ${error.message}`);
	console.error(error);
	process.exit(1);
}
