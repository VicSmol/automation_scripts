#!/bin/env node

//TODO There's need to write description about this script

'use strict';

const {execFileSync, execSync} = require("node:child_process");

console.info('VirtualBox update start\n');

try {
	const linuxKernelVersion = execSync('uname -r', {encoding: 'utf-8'}).trim();
	const instructions = [
		{
			command: 'apt-get', args: ['update']
		},
		{
			command: 'apt-get', args: [
				'install',
				'-y',
				'--reinstall',
				`linux-headers-${linuxKernelVersion}`,
				'virtualbox-dkms',
				'dkms'
			]
		},
		{
			command: 'modprobe', args: ['vboxdrv']
		}
	];

	console.debug(`The Linux kernel version is ${linuxKernelVersion}\n`);

	instructions.forEach((instruction, index) => {
		console.log(`--------------Command ${index + 1}-----------------`);
		console.info(`The command "${instruction.command} ${instruction.args.join(' ')}" is start execute\n`);

		const output = execFileSync(instruction.command, instruction.args, {encoding: 'utf-8'});

		console.debug(output);
		console.info(`\nThe command "${instruction.command} ${instruction.args.join(' ')}" has been executed`);
		console.log(`----------------------------------------\n`);
	});

	console.info('VirtualBox has been updated\n');

	process.exit(0);
} catch (error) {
	console.error('VirtualBox has not been updated!\n');
	console.error(`ERROR: ${error}`);
	console.error(error);

	process.exit(1);
}
