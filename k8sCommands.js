#!/bin/env node

// TODO: Append description

'use strict';

const stream = require('node:stream');
const net = require('node:net');
const k8s = require('@kubernetes/client-node');
const {extractValue, getTimeFormat} = require('./utils');
const namespace = extractValue('--namespace');
const command = extractValue('--command');
const serviceName = extractValue('--service-name')
const duration = parseInt(extractValue('--duration')) || 1000 * 60 * 15; // measures in milliseconds

/**
 * @type {{serviceName: string, port: number}[]}
 * */
const targets = JSON.parse(extractValue('--targets') || '[]');
const kc = new k8s.KubeConfig();

kc.loadFromFile('/home/victor/.kube/config_dhrm');

const k8sPodsApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sNamespaceApi = kc.makeApiClient(k8s.AppsV1Api);
const log = new k8s.Log(kc);
const portForward = new k8s.PortForward(kc);

const disconnectAfterDelay = async (request, ms) => {
	await new Promise(resolve => setTimeout(resolve, ms));
	request.abort();

	console.info('\n\nDisconnecting...');
	console.info(`The time ${ms}ms is over\n`);
};

const getPods = async (namespace) => {
	const {body} = await k8sPodsApi.listNamespacedPod(namespace);
	return body.items;
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
		const serviceInfo = {
			'NAME': metadata.name,
			'READY': status.readyReplicas || 0,
			'UP-TO-DATE': status.updatedReplicas || 0,
			'AVAILABLE': status.availableReplicas || 0,
			'AGE_HOURS': getTimeFormat(creationTimestamp),
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

const fetchAndStreamPodLogs = async (namespace, serviceName) => {
	try {
		const targetPod = (await getPods(namespace))?.find(pod => pod.metadata.labels['app.kubernetes.io/name'] === serviceName);

		if (!targetPod) {
			throw new Error(`Pod with service name '${serviceName}' not found in namespace '${namespace}'.`);
		}

		const podName = targetPod.metadata.name;
		const containerName = targetPod.spec.containers[0].name;
		const logStream = new stream.PassThrough();

		logStream.on('data', (chunk) => {
			process.stdout.write(chunk);
		});

		const logRequest = await log.log(namespace, podName, containerName, logStream, {
			follow: true, tailLines: 50, pretty: true, timestamps: false,
		});

		await disconnectAfterDelay(logRequest, duration);
	} catch (error) {
		console.error(error.message);
		console.error(error);
	}
};

const scalePodByOne = async (namespace, serviceName, increase = 1) => {
	try {
		const deployment = await k8sNamespaceApi.readNamespacedDeployment(serviceName, namespace)
			.then(({body}) => body);

		deployment.spec.replicas += increase;

		const responce = await k8sNamespaceApi.replaceNamespacedDeployment(serviceName, namespace, deployment);

		console.info(`\nPod ${serviceName} was scaled by ${increase}`);
		console.info(`Pod ${serviceName} replicas is | ${responce.body.spec.replicas} |\n`);
	} catch (error) {
		console.error(`ERROR: ${error.message}`);
		console.error(error);
	}
};

/**
 * Forward ports based on specified targets within a given namespace.
 *
 * @param {string} namespace - The namespace to search for pods.
 * @param {{serviceName: string, targetPort: number}[]} targets - The array of target service names to match with pods.
 */
const forwardPorts = async (namespace, targets) => {
	try {
		const pods = await getPods(namespace);
		const podMap = new Map(pods.map(pod => [
			pod.metadata.labels['app.kubernetes.io/name'],
			pod
		]));

		const fullTargets = targets.map(target => {
			const pod = podMap.get(target.serviceName);

			if (!pod) {
				throw new Error(`Pod with service name '${target.serviceName}' not found in namespace '${namespace}'.`);
			}

			return {podName: pod.metadata.name, ...target};
		});

		if (fullTargets?.length === 0) {
			throw new Error(`Pods with services names '${serviceNames.join(', ')}' not found in namespace '${namespace}'.`);
		}

		for (const target of fullTargets) {
			const server = net.createServer(async (socket) => {
				portForward.portForward(namespace, target.podName, [target.port], socket, socket, socket);

				socket.on('error', (error) => {
					console.error(`\nConnection ERROR: ${error.message}`);
					console.error(error);
				});

				socket.on('end', () => {
					console.debug(`\nThe Pod ${target.serviceName} has been disconnected`);
					console.debug(`Connection Ended\n`);
				});

				socket.on('close', () => {
					console.debug(`\nThe Pod ${target.serviceName} has been disconnected`);
					console.debug(`Connection Closed\n`);
				});

				socket.on('timeout', () => {
					console.debug(`\nThe Pod ${target.serviceName} has been disconnected`);
					console.debug(`Connection Timeout\n`);
				});
			});

			server.listen(target.port, '127.0.0.1', () => {
				console.log(`\nPort Forwarding Established`);
				console.log(`[${target.serviceName}:${target.port}] <-> 127.0.0.1:${server.address().port}`);
				console.log(`Connection Started...\n`);
			});
		}
	} catch (error) {
		console.error(`\nERROR: ${error.message}`);
		console.error(error);
	}
}

async function main() {
	const commands = new Map();

	commands.set('get_pods_list', {action: getPodsList, args: [namespace]});
	commands.set('get_service_info', {
		action: getServiceInfo, args: [
			namespace,
			serviceName
		]
	});
	commands.set('get_pod_logs', {
		action: getPodLogs, args: [
			namespace,
			serviceName
		]
	});
	commands.set('get_pod_logs_real_time', {
		action: fetchAndStreamPodLogs, args: [
			namespace,
			serviceName,
			duration
		]
	});
	commands.set('scale_up_service', {
		action: scalePodByOne, args: [
			namespace,
			serviceName,
			1
		]
	});
	commands.set('scale_down_service', {
		action: scalePodByOne, args: [
			namespace,
			serviceName,
			-1
		]
	});
	commands.set('forward_port', {
		action: forwardPorts, args: [
			namespace,
			targets
		]
	});
	commands.set('unforward_port', {action: getPodsList, args: [namespace]}); // ?
	commands.set('get_environment_info', {action: getPodsList, args: [namespace]}); // ?

	const selectedCommand = commands.get(command);

	selectedCommand.action(...selectedCommand.args);
}

main();
