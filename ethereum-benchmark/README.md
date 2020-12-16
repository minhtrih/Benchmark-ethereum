# Ethereum-Benchmark  
A collection of utilities for creating & benchmarking private Ethereum network

# Getting started
## Prerequisites
You need standard Geth installation to get started.  
In Debian/Ubuntu, you can run the following command to install required toolset:  
```sh
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```
Ethereum-benchmark has been tested against Geth version 1.8.18 on Ubuntu 18.04.

## Installation
Clone this repository by doing 
```sh
git clone https://github.com/puilp0502/ethereum-benchmark
```

## Deploying network
First, create the bootnode's key:
```sh
bootnode -genkey boot.key
```
  
Then, generate node keys:
```sh
./gennodekey.sh [number of nodes]
```

Create genesis config using puppeth:
```sh
puppeth
```
Puppeth will ask you a few questions. Answer them as you like.  
Note that Ethereum-benchmark expects network id of `1515`. If you change this, you need to manually change node startup script(`start_node*.sh`). It also expects genesis config to be located at `genesis.json`.  

Now, initialize your nodes:
```sh
./initnode.sh
```

If everying is completed without error, you should be able to start nodes now.  
First, start bootnode:
```sh
./start_bootnode.sh
```
Then, in the other terminal(s), start nodes by doing:
```sh
./start_node[number].sh
```
The nodes should be up and mining that sweet sweet blocks.

## Running benchmark
```sh
cd benchmark
npm install
node index.js
```
Benchmark result will be stored in `results/` directory.

# License
This utility is licensed under MIT License - see LICENSE file for details.

# Acknowledgements
This utility is originally based on [the post](https://hackernoon.com/setup-your-own-private-proof-of-authority-ethereum-network-with-geth-9a0a3750cda8) written by Salanfe.
# Benchmark-ethereum
