"use strict";

const fs = require('fs');
const Web3 = require('web3');

const version = require('./package.json').version;

console.log("Connecting to local RPC...");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
console.log("Connected");

web3.eth.getTransactionReceipt("0x07e547a3f469475eef0cc8bcf083c8cb85dfb43fba8d02938e121230054d2f7b").then(console.log);

