#!/bin/env node

//TODO append description

'use strict';

const {execSync} = require('node:child_process');
const {extractValue} = require('./utils.js');
const alarmSound = extractValue('--alarm-sound');
const audioDevice = extractValue('--audio-device');
const time = extractValue('--time');
const commands = {
	'set_output_device': `pacmd set-default-sink ${audioDevice}`,
	'set_output_volume': `pactl set-sink-volume ${audioDevice} 100%`,
	'wake_on_time': `sudo /usr/sbin/rtcwake --mode mem --local -v --date '${time}'`,
	'run_alarm': `ffplay -nodisp -v 0 -volume 100 ${alarmSound}`,
}
const error = `Sink ${audioDevice} does not exist.`;

try {
	const commandOutput = execSync(`${commands['set_output_device']}`, {encoding: 'utf-8'});

	if (commandOutput.trim() === error) {
		throw new Error(error);
	}

	execSync(`${commands['set_output_volume']}`, {encoding: 'utf-8'});
	execSync(commands['wake_on_time'], {encoding: 'utf-8'});
	execSync(commands['run_alarm'], {encoding: 'utf-8'});
} catch (error) {
	console.error(`ERROR: ${error.message}`);
	console.error(error);
	process.exit(1);
}

process.exit(0);
