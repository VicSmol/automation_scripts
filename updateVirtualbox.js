#!/bin/env node

//TODO There's need to write description about this script

'use strict';

const {spawnSync} = require("node:child_process");
const instructions = [
	{
		command: 'apt', args: ['update']
	},
	{
		command: 'apt', args: [
			'install',
			'-y',
			'--reinstall',
			'linux-headers-$(uname -r)',
			'virtualbox-dkms',
			'dkms'
		]
	},
	{
		command: 'modprobe', args: ['vboxdrv']
	}
];

console.info('VirtualBox update start\n');

try {
	instructions.forEach((instruction, index) => {
		console.log(`---------Command ${index + 1}-----------`);
		console.info(`The command "${instruction.command} ${instruction.args.join(' ')}" is start execute\n`);

		const {stdout, stderr, status, signal, pid} = spawnSync(instruction.command, instruction.args, {encoding: 'utf8'});

		console.debug({pid, status, signal, stdout, stderr});
		console.info(`\nThe command "${instruction.command} ${instruction.args.join(' ')}" has been executed`);
		console.log(`-----------------------------------------\n`);
	});

	console.info('VirtualBox has been updated\n');
} catch (error) {
	console.info('VirtualBox has not been updated\n');
	console.error(`ERROR: ${error}`);

	process.exit(1);
}

process.exit(0);
