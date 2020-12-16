const fs = require('fs');
const util = require('util');

// Promise FTW
fs.readFileAsync = util.promisify(fs.readFile);

const load = function (name) {
	console.info(`Loading contract "${name}"`);
	return fs.readFileAsync(`contracts/${name}.cache.json`, 'utf8').then(text => {
		let contract = JSON.parse(text);
		return { abi: JSON.parse(contract.interface), bytecode: contract.bytecode }
	}, err => {
		console.log("Cache does not exist; recompiling source...");
		const solc = require('solc');
		return fs.readFileAsync(`contracts/${name}.sol`, 'utf8').then(text => {
			let input = { [`${name}.sol`]: text };
			let output = solc.compile({ sources: input }, 1, () => { throw new Error("Import not supported") });
			let contractNames = Object.keys(output.contracts);
			console.log('contractNames', contractNames);
			if (contractNames.length > 1) console.warn("Warning: more than one contract exists");
			let contract = output.contracts[contractNames[0]];
			fs.writeFileSync(`contracts/${name}.cache.json`, JSON.stringify(contract));
			console.log('Compile success');
			return { abi: JSON.parse(contract.interface), bytecode: contract.bytecode }
		})
	})
}

module.exports = load;
