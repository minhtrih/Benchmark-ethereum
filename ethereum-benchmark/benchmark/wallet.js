const fs = require('fs');
const glob = require('glob');
const Web3 = require('web3');

const web3 = new Web3();

const accountsJson = 'accounts.json';
let accounts = [];
try {
	accounts = JSON.parse(fs.readFileSync(accountsJson, 'utf8'))
} catch (e) {
	if (e.code !== 'ENOENT') {
		throw e;
	}
	console.log("accounts.json does not exist; loading from keystore..");
	let keystores = glob.sync("../../node4/keystore/*");
	for (keystore of keystores) {
		accounts.push(JSON.parse(fs.readFileSync(keystore, 'utf8')));
	}
	fs.writeFileSync(accountsJson, JSON.stringify(accounts));
}

const password = fs.readFileSync('./password.txt', 'utf-8').replace(/\n/g, '');
module.exports = web3.eth.accounts.wallet.decrypt(accounts, password);
