#!/bin/env node

const {execSync} = require('child_process');
const getValue = require('./utils').getValue;
const modes = {
	'a2dp_sink': 'a2dp_sink', 'headset_head_unit': 'headset_head_unit', 'off': 'off',
};
const commands = {
	'get_headphone_profile': "pactl list cards | awk -v RS='' '/bluez/' | awk -F': ' '/Active Profile/ { print $2 }'",
	'set_headphone_profile': 'pactl set-card-profile bluez_card.F8_AB_E5_65_5B_67'
};

try {
	// TODO Fix --device_name arg parsing
	const deviceName = getValue('--device_name');
	const currentProfile = execSync(commands.get_headphone_profile, {encoding: 'utf8'}).trim();

	console.info(`The current headphone profile is ${currentProfile}`);

	switch (currentProfile) {
		case modes.a2dp_sink:
			execSync(`${commands.set_headphone_profile} ${modes.headset_head_unit}`);
			console.info(`The headphone has been switched to the ${modes.headset_head_unit} profile`);
			break;
		case modes.headset_head_unit:
		case modes.off:
		default:
			execSync(`${commands.set_headphone_profile} ${modes.a2dp_sink}`);
			console.info(`The headphone has been switched to the ${modes.a2dp_sink} profile`);
			break;
	}
} catch (error) {
	console.error(`Error: ${error.message} | ${error}`);
	process.exit(1);
}

process.exit(0);
