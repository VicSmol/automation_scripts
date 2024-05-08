#!/bin/env node

// TODO: Append description

'use strict';

const {extractValue} = require('./utils');
const k8s = require('@kubernetes/client-node');
const namespace = extractValue('--namespace');
const command = extractValue('--command');
const kc = new k8s.KubeConfig();

kc.loadFromFile('/home/victor/.kube/config_dhrm');

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const getPodList = (ns) => k8sApi.listNamespacedPod(ns)
	.then(response => response.body.items)
	.then(pods => {
		const podsInfo = pods.map(pod => {
			const serviceOption = [
				{name: pod.metadata.labels['app.kubernetes.io/name'], type: 'pod'},
				{name: pod.metadata.labels['job-name'], type: 'job'},
				{name: pod.metadata.labels['app'], type: 'app'},
			].filter(option => option.name).at(0);

			return {
				name: serviceOption.name, type: serviceOption.type, phase: pod.status.phase,
			};
		});

		console.info(`Namespace: ${ns}`);
		console.table(podsInfo);
	})
	.catch(error => {
		console.error(`ERROR: ${error.message}`);
		console.error(error);
	});

const commands = new Map();

commands.set('get_pods_list', {action: getPodList, args: [namespace]});
commands.set('get_service_info', {action: getPodList, args: [namespace]});
commands.set('get_environment_info', {action: getPodList, args: [namespace]});
commands.set('get_pod_logs', {action: getPodList, args: [namespace]});
commands.set('scale_up_service', {action: getPodList, args: [namespace]});
commands.set('scale_down_service', {action: getPodList, args: [namespace]});
commands.set('forward_port', {action: getPodList, args: [namespace]});
commands.set('unforward_port', {action: getPodList, args: [namespace]});

const selectedCommand = commands.get(command);

selectedCommand.action(...selectedCommand.args);
