"use strict";

const {execSync} = require("node:child_process");
const commands = [
	'apt update',
	'apt install --reinstall linux-headers-$(uname -r) virtualbox-dkms dkms',
	'modprobe vboxdrv',
	// 'reboot': 'reboot',
];

console.info('VirtualBox update start');

try {
	commands.forEach(command => {
		console.info(`The command "${command}" is start execute`);
		execSync(command);
		console.info(`The command ${command} has been executed`);
	});
} catch (error) {
	console.error(`ERROR: ${error}`);
	process.exit(1);
}
