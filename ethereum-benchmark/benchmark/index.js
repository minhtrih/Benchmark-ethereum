const fs = require('fs');

const Web3 = require('web3');
const loadContract = require('./contracts.js');

const usingWeb3 = true;
if (usingWeb3) {
	// connect to your node blockchain
	console.log("Connecting to local RPC...");
	var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	console.log("Connected");

	// load account from your node
	var wallet = require('./wallet.js');
	web3.eth.accounts.wallet = wallet;
	console.log("Loaded accounts");

	// var address_from = wallet[0].address;
	// var address_to = wallet[0].address
	var address_from = '0xa80e4A2f55fcA9bf038569D36D6e002fBE2b55d0';
	var address_to = '0x2B65984D4B4bfb580e30339E77ECA7720d94e2f8';

	// Create dummy contract (will be filled later)
	var dummyContract = new web3.eth.Contract([], '', { from: address_from });
}

const data = JSON.parse(fs.readFileSync('data_test/data_1KB.json', 'utf8'))

const config = {
	TxGenerator: (contract, i) => contract.methods.set(i, data),
	TxCount: 100,
	TxGas: 3000000,
	ContractAddr: '',
	file_benchmark: 'result/result_2020-12-08T07:21:45.987Z.json'
	// file_benchmark: 'result/result_2020-12-08T03:14:01.469Z.json'
}

const benchStarted = new Date();

function createTransactionBySmartContract() {
	loadContract('kvstore').then(({ abi, bytecode }) => {
		dummyContract.options.jsonInterface = abi;
		bytecode = "0x" + bytecode
		let deployTx = dummyContract.deploy({ data: bytecode });
		if (config.ContractAddr == '') {
			console.log('Deploying contract..');
			return deployTx.estimateGas()
				.then(gasEstimate => deployTx.send({ from: address_from, gas: gasEstimate }),
					(e) => console.log('estimate gas error', e))
		} else {
			console.log('Contract address provided; Using exising contract');
			let contract = dummyContract.clone();
			contract.options.address = config.ContractAddr;
			return contract;
		}
	}).catch(e => console.log('deploy error', e))
		.then(contract => {
			console.log(`Contract deployed at ${contract.options.address}`);
			return web3.eth.getTransactionCount(address_from)
				.then(txCount => [contract, txCount])
		})
		.then(([contract, txCount]) => {
			let log = [];
			let promises = [];
			// let loggers = {};
			let TxRange = [];
			for (let i = 0; i < config.TxCount; i++) TxRange.push(i);
			// const createLogger = field => TxRange.map((i) => () => { log[i][field] = new Date().valueOf(); });
			// loggers.submitted = createLogger('submitted');
			// loggers.receipt = createLogger('receipt');
			// loggers.processed = createLogger('processed');

			console.log("Sending Transactions...");
			const beforeSend = new Date();
			for (let i = 0; i < config.TxCount; i++) {
				log[i] = {
					No: i + 1,
					sent: new Date().valueOf()
				};
				let promise = config.TxGenerator(contract, i).send({ gas: config.TxGas })
					.on('transactionHash', function (hash) {
						log[i].transactionHash = hash;
					})
					// .on('transactionHash', loggers.submitted[i])
					// .on('receipt', loggers.receipt[i])
					// .then(loggers.processed[i])
					.catch(err => console.error(err));
				promises.push(promise);
			}
			const afterSend = new Date();
			console.log("Transaction sent");
			console.log(`Transaction submission took ${afterSend - beforeSend}ms`);
			Promise.all(promises)
				.then(() => {
					fs.writeFileSync("result/result_" + benchStarted.toISOString() + ".json", JSON.stringify(log))
					console.log("Transaction completed");
				})
				.catch((e) => { console.error(e); console.log(log); });
		});
}

function createTransactionbySendTransaction() {
	console.log('createTransactionbySendTransaction');
	const benchStarted = new Date();

	let log = [];
	let promises = [];

	console.log("Sending Transactions...");
	const beforeSend = new Date();
	for (let i = 0; i < config.TxCount; i++) {
		let promise = web3.eth.sendTransaction({
			from: address_from,
			to: address_to,
			gas: config.TxGas,
			data: '603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3'
		})
			.on('transactionHash', function (hash) {
				log[i] = {
					No: i + 1,
					sent: new Date().valueOf(),
					transactionHash: hash
				};
			})
			.catch(err => console.error(err)); // If a out of gas error, the second parameter is the receipt.
		promises.push(promise);
	}

	const afterSend = new Date();
	console.log("Transaction sent");
	console.log(`Transaction submission took ${afterSend - beforeSend}ms`);
	Promise.all(promises)
		.then(() => {
			fs.writeFileSync("result/result_" + benchStarted.toISOString() + ".json", JSON.stringify(log))
			console.log("Transaction completed");
		})
		.catch((e) => { console.error(e); console.log(log); });
}

function getBlock() {
	const data = fs.readFileSync(config.file_benchmark,
		{ encoding: 'utf8', flag: 'r' });
	const log = JSON.parse(data);

	let promises = [];
	for (let i = 0; i < config.TxCount; i++) {
		web3.eth.getTransaction(log[i].transactionHash)
			.then(infoTransation => {
				log[i].blockNumber = infoTransation.blockNumber;
				let promise = web3.eth.getBlock(log[i].blockNumber)
					.then(infoBlock => {
						log[i].committed = infoBlock.timestamp;
						console.log('committed', log[i].committed);
					})
					.catch(err => console.error(err));
				promises.push(promise);
			})
			.catch(err => console.error(err));
	}
	Promise.all(promises)
		.then(() => {
			// fs.writeFileSync("result/result_" + benchStarted.toISOString() + ".json", JSON.stringify(log))
			console.log("Transaction completed");
		})
		.catch((e) => { console.error(e); console.log(log); });
}

function getBlockNumberFromTransaction() {
	console.log(getBlockNumberFromTransaction);
	const data = fs.readFileSync(config.file_benchmark,
		{ encoding: 'utf8', flag: 'r' });
	const log = JSON.parse(data);

	let promises = [];
	for (let i = 0; i < config.TxCount; i++) {
		let promise = web3.eth.getTransaction(log[i].transactionHash)
			.then(info => {
				log[i].blockNumber = info.blockNumber;
			})
			.catch(err => console.error(err));
		promises.push(promise);
	}
	Promise.all(promises)
		.then(() => {
			fs.writeFileSync(config.file_benchmark, JSON.stringify(log))
			console.log("Transaction completed");
		})
		.catch((e) => { console.error(e); console.log(log); });
}

function getTimestampFromBlock() {
	console.log('getTimestampFromBlock');
	const data = fs.readFileSync(config.file_benchmark,
		{ encoding: 'utf8', flag: 'r' });
	const log = JSON.parse(data);

	let promises = [];
	for (let i = 0; i < config.TxCount; i++) {
		let promise = web3.eth.getBlock(log[i].blockNumber)
			.then(info => {
				log[i].committed = info.timestamp;
			})
			.catch(err => console.error(err));
		promises.push(promise);
	}
	Promise.all(promises)
		.then(() => {
			fs.writeFileSync(config.file_benchmark, JSON.stringify(log))
			console.log("Transaction completed");
		})
		.catch((e) => { console.error(e); console.log(log); });
}

function averageTXS() {
	console.log('averageTXS');
	const data = fs.readFileSync(config.file_benchmark,
		{ encoding: 'utf8', flag: 'r' });
	const log = JSON.parse(data);

	let totalTimeCommitted = 0
	for (let i = 0; i < config.TxCount; i++) {
		const time = log[i].committed * 1000 - log[i].sent;
		totalTimeCommitted += time;
	}
	console.log(`1000 Transaction submission took ${totalTimeCommitted / config.TxCount}ms`);
}

function averageBlock() {

}

createTransactionBySmartContract();
// getBlockNumberFromTransaction();
// getTimestampFromBlock();
// averageTXS();

