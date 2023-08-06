#!/bin/env node

//TODO There's need to write description about this script

'use strict';

const {execSync} = require('node:child_process');
const extractValue = require('./utils').extractValue;
const deviceName = extractValue('--device-name');
const modes = {
	'a2dp_sink': 'a2dp_sink', 'headset_head_unit': 'headset_head_unit', 'off': 'off',
};
const commands = {
	'get_headphone_profile': `pactl list cards | awk -v RS='' '/${deviceName}/' | awk -F': ' '/Active Profile/ { print $2 }'`,
	'set_headphone_profile': `pactl set-card-profile ${deviceName}`
};

try {
	const currentProfile = execSync(commands.get_headphone_profile, {encoding: 'utf8'}).trim();
	const targetProfile = currentProfile === modes.a2dp_sink ? modes.headset_head_unit : modes.a2dp_sink;

	console.info(`The current headphone profile is ${currentProfile}`);
	execSync(`${commands.set_headphone_profile} ${targetProfile}`);
	console.info(`The headphone has been switched to the ${targetProfile} profile`);
} catch (error) {
	console.error(`Error: ${error.message} | ${error}`);
	process.exit(1);
}

process.exit(0);
