#!/bin/env node

//TODO append description

'use strict';

const {execSync} = require('node:child_process');
const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
const extractValue = require('./utils.js').extractValue;
// const namespace = extractValue('--namespace');
const namespace = 'review-vivsmolyakov-feat-tuv-396233-calendar-stend-a1278df6';
const command = extractValue('--command');
const serviceName = extractValue('--serviceName');
const ports = (extractValue('--ports') || '[]')
	.replace(/[\[\]]/g, '')
	.split(',')
	.map(ports => ports.split(':'));
const commands = [
	'get_service_info',
	'scale_down_by_one',
	'scale_up_by_one',
	'port_forwards'
];

const temp = process.env;
// process.env.PATH += ':/snap/bin/kubectl';
// console.table(process.env.PATH.split(':'));

const {exec} = require('child_process');

exec('docker version', (error, stdout, stderr) => {
	if (error) {
		console.error(`Error executing command: ${error}`);
		console.error(`Exit Code: ${error.code}`);
		console.error(`Error Signal: ${error.signal}`);
	}
	if (stderr) {
		console.error(`stderr: ${stderr}`);
		return;
	}
	console.log(`stdout: ${stdout}`);
});
