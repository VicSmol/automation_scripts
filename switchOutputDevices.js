#!/bin/env node

//TODO There's need to write description about this script

'use strict';

const {execSync} = require('node:child_process');
const extractValue = require('./utils').extractValue;
const isReverseOrder = extractValue('--reverse-order') === true;
const getOutputDevices = () => execSync("pacmd list-sinks " +
	"| grep 'name: ' " +
	"| grep -E '[^<>]+' " +
	"| awk '{print $2}'", {encoding: 'utf-8'})
	.split('\n')
	.filter(deviceName => deviceName)
	.map(deviceName => deviceName.slice(1, -1));
const getActiveDevice = () => execSync("pactl info " +
	"| grep -iE 'Default\\s+Sink' " +
	"| awk '{print $3}'", {encoding: 'utf-8'})
	.trim();
/**
 * @param {string[]} devices
 * @param {string} currentDevice
 */
const switchOutputDevice = (devices, currentDevice, isReverseOrder = false) => {
	const index = devices.findIndex((value) => value === currentDevice);
	const diff = isReverseOrder ? -1 : 1;
	const nextIndex = (index + diff + devices.length) % devices.length;

	execSync(`pacmd set-default-sink ${devices[nextIndex]}`, {encoding: 'utf-8'});
}

try {
	const outputDevices = getOutputDevices();
	const activeDevice = getActiveDevice();

	switchOutputDevice(outputDevices, activeDevice, isReverseOrder);
} catch (error) {
	console.error(`Error: ${error.message} | ${error}`);
	process.exit(1);
}

process.exit(0);
