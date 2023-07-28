'use strict';

const {spawn, exec,} = require('node:child_process');
const getValue = require('./utils').getValue;

const localUser = getValue('--local-user');
const remoteUser = getValue('--remote-user');
const host = getValue('--host');
const port = getValue('--port');
const privateKayName = getValue('--private-key-name');
const command = `ssh -N -n -i /home/${localUser}/.ssh/${privateKayName} -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=no' +
	' -L $i ${remoteUser}@${host} -p ${port} &`
