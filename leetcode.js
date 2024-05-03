// /**
//  * @param {Function} fn
//  * @param {number} t
//  * @return {Function}
//  */
//
// const main = async () => {
// 	const fn = async (n) => {
// 		await new Promise(res => setTimeout(res, 100));
// 		return n * n;
// 	};
// 	const t = 150;
// 	const timeLimit = function (fn, t) {
// 		return async function (...args) {
// 			const newFn = async () => new Promise(setTimeout(() => {
// 				throw 'Time Limit Exceeded';
// 			}, t));
//
// 			return Promise.race([
// 				fn(...args),
// 				newFn(...args)
// 			]).then(data => {
// 				if (data === undefined) {
// 					return new Error('Time Limit Exceeded');
// 				}
//
// 				return data;
// 			}).catch(error => error.message);
// 		}
// 	};
//
// 	const limited = timeLimit(fn, t);
// 	const start = performance.now();
// 	const inputs = [5];
// 	let result;
//
// 	try {
// 		const res = await limited(...inputs);
// 		result = {"resolved": res, "time": Math.floor(performance.now() - start)};
// 	} catch (err) {
// 		result = {"rejected": err, "time": Math.floor(performance.now() - start)};
// 	}
// 	console.log(result); // Output
//
// 	/**
// 	 * const limited = timeLimit((t) => new Promise(res => setTimeout(res, t)), 100);
// 	 * limited(150).catch(console.log) // "Time Limit Exceeded" at t=100ms
// 	 */
// };
//
// main();
"use strict";

const array = [{a: 1, b: 2}, {a: 3, b: 4}, {a: 1, b: 2}];
const counts = array.reduce((acc, cur) => {
	if (acc[`${cur.a}|${cur.b}`] === undefined) {
		acc[`${cur.a}|${cur.b}`] = 1;
	} else {
		acc[`${cur.a}|${cur.b}`]++;
	}

	return acc;
}, {});
const result = array.filter(item => {
	if (counts[`${item.a}|${item.b}`] > 0) {
		delete counts[`${item.a}|${item.b}`];

		return item;
	}
});

console.log(counts);
console.log(result);
