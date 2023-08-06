#!/bin/env node

//TODO append description

'use strict';

const fs = require('node:fs');
const {execFile, execFileSync, execSync} = require('node:child_process');
const extractValue = require('./utils').extractValue;
const remoteUser = extractValue('--remote-user');
const host = extractValue('--host');
const port = extractValue('--port');
const privateKeyPath = extractValue('--private-key-path');
const datasetPath = extractValue('--dataset');
//TODO ask DEVOPS about every service and write description for it
/** @type {{network: string, hosts: string[], forwarding: string[]}[]} */
const dataset = JSON.parse(fs.readFileSync(datasetPath, {encoding: 'utf-8'}));
const hostsPath = '/etc/hosts';
const backupHostsPath = '/etc/hosts_backup';

const removeLoopbackNetworks = () =>
	execSync('ip -o address show dev lo ' +
		"| grep -Eo '127.0.0.[0-9]+/[0-9]+' " +
		"| awk '{print $1}' " +
		'| tail -n +2', {encoding: 'utf-8'})
		.split('\n')
		.filter(network => network)
		.map(network => network.trim())
		.forEach(network => execSync(`ip addr del ${network} dev lo`));

/**
 * @param {string} privateKeyPath
 */
const killOldTunnels = (privateKeyPath) =>
	execSync('ps -Aww -o "pid args"' +
		`| grep 'ssh -N -n -i ${privateKeyPath} -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=no -L '` +
		'| head -n -1 ' +
		'| grep -Eo "[0-9]+ ssh" ' +
		'| awk "{ print $1 }"', {encoding: 'utf-8'})
		.split('\n')
		.filter(pid => pid)
		.map(pid => parseInt(pid.trim()))
		.forEach(pid => process.kill(pid));

try {
	console.info('------------------1) Hosts backup file checking----------------');
	console.info('          Start hosts file backup checking...');

	if (fs.existsSync(backupHostsPath)) {
		console.info('          Hosts backup file file exist |+|');
	} else {
		console.info('          Start creating hosts backup file...');

		fs.cpSync(hostsPath, backupHostsPath);

		console.info('          Hosts backup file was created |+|');
	}

	console.info('          Hosts backup checked! |+|');
	console.info('---------------------------------------------------------------\n');

	console.info('------------------2) Loopback networks cleaning----------------');
	console.info('          Start additional Loopback networks cleaning...');

	removeLoopbackNetworks();

	console.info('          Loopback networks cleaning was finished |+|');
	console.info('---------------------------------------------------------------\n');

	console.info('------------------3) Copy hosts backup file to hosts-----------');
	console.info('          Start copy backup of hosts file to hosts...');

	fs.cpSync(backupHostsPath, hostsPath);

	console.info('          Backup of hosts file to hosts was finished |+|');
	console.info('---------------------------------------------------------------\n');

	console.info('------------------4) Old ssh tunnels cleaning------------------');
	console.info('          Start old ssh tunnels cleaning...');

	killOldTunnels(privateKeyPath);

	console.info('          Old ssh tunnels cleaning was finished |+|');
	console.info('---------------------------------------------------------------\n');

	console.info('------------------5) Appending networks to loopback interface--');
	console.info('          Start old ssh tunnels cleaning...');

	dataset.forEach(service => execFileSync(`ip addr add ${service.network}/8 dev lo`));

	console.info('          Old ssh tunnels cleaning was finished |+|');
	console.info('---------------------------------------------------------------\n');

	console.info('------------------6) Forwarded services append to hosts file---');
	console.info('          Start appending services to hosts file...');

	dataset.forEach(service => {
		service.hosts.forEach(host => {
			fs.appendFileSync(hostsPath, `${service.network} ${host}`);
		});
	});

	console.info('          Forwarded services appending to hosts file was finished |+|');
	console.info('---------------------------------------------------------------\n');

	console.info('------------------7) Make SSH tunnels--------------------------');
	console.info('          Start SSH tunnels creating...');

	dataset.forEach(service =>
		service.forwarding.forEach(tunnel =>
			execFile("ssh -N -n -i privateKeyPath -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=no -L " +
				`${tunnel} ${remoteUser}@${host} -p	${port}`))
	);

	console.info('          SSH tunnels creating was finished |+|');
	console.info('---------------------------------------------------------------\n');
} catch (error) {
	console.error(`Error: ${error.message} | ${error}`);
	process.exit(1);
}

process.exit(0);
