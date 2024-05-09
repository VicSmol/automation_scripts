#!/bin/env node

// TODO: Append description

'use strict';

const {extractValue} = require('./utils');
const k8s = require('@kubernetes/client-node');
const namespace = extractValue('--namespace');
const serviceName = extractValue('--service-name');
const command = extractValue('--command');
const podName = extractValue('--pod-name');
const kc = new k8s.KubeConfig();

kc.loadFromFile('/home/victor/.kube/config_dhrm');

const k8sPodsApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sNamespaceApi = kc.makeApiClient(k8s.AppsV1Api);

const getPods = async (namespace) => {
	const {items} = await k8sPodsApi.listNamespacedPod(namespace);
	return items;
};
const getPodsList = async (namespace) => {
	try {
		const pods = await getPods(namespace);
		const podsInfo = pods.map(pod => {
			const serviceOption = [
				{name: pod.metadata.labels['app.kubernetes.io/name'], type: 'pod'},
				{name: pod.metadata.labels['job-name'], type: 'job'},
				{name: pod.metadata.labels['app'], type: 'app'},
			].find(option => option.name);

			return {
				name: serviceOption.name, type: serviceOption.type, phase: pod.status.phase,
			};
		});

		console.info(`Namespace: ${namespace}`);
		console.table(podsInfo);
	} catch (error) {
		console.error(`ERROR: ${error.message}`);
		console.error(error);
	}
};

const getServiceInfo = async (namespace, serviceName) => {
	try {
		const {body: deployment} = await k8sNamespaceApi.readNamespacedDeployment(serviceName, namespace);
		const {metadata, status} = deployment;
		const creationTimestamp = new Date(metadata.creationTimestamp);
		const hoursPassed = Math.floor((Date.now() - creationTimestamp) / (1000 * 60 * 60));
		const serviceInfo = {
			'NAME': metadata.name,
			'READY': status.readyReplicas,
			'UP-TO-DATE': status.updatedReplicas,
			'AVAILABLE': status.availableReplicas,
			'AGE_HOURS': hoursPassed
		};

		console.info(`Service ${serviceName} information:`);
		console.table([serviceInfo]);
	} catch (error) {
		console.error(`ERROR: ${error.message}`);
		console.error(error);
	}
};

const getPodLogs = async (namespace, serviceName) => {
	try {
		const {metadata} = (await getPods(namespace))?.find(pod => pod.metadata.labels['app.kubernetes.io/name'] === serviceName);
		const {body} = await k8sPodsApi.readNamespacedPodLog(metadata.name, namespace);

		console.table(body);
	} catch (error) {
		console.error(`ERROR: ${error.message}`);
		console.error(error);
	}
};

const commands = new Map();

commands.set('get_pods_list', {action: getPodsList, args: [namespace]});
commands.set('get_service_info', {
	action: getServiceInfo, args: [
		namespace,
		serviceName
	]
});
commands.set('get_environment_info', {action: getPodsList, args: [namespace]}); // ?
commands.set('get_pod_logs', {
	action: getPodLogs, args: [
		namespace,
		serviceName
	]
});
commands.set('scale_up_service', {action: getPodsList, args: [namespace]});
commands.set('scale_down_service', {action: getPodsList, args: [namespace]});
commands.set('forward_port', {action: getPodsList, args: [namespace]});
commands.set('unforward_port', {action: getPodsList, args: [namespace]});

const selectedCommand = commands.get(command);

selectedCommand.action(...selectedCommand.args);
