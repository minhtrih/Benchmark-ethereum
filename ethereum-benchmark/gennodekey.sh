#!/bin/bash

NETWORK_ID=1515

# Ensure there exists bootnode key.
if [[ ! -f boot.key ]]; then
	>&2 echo "Error: bootnode key does not exists."
	exit -1
fi

# Get bootnode enode
boot_enode=$(bootnode -writeaddress -nodekey boot.key)

# Get password for keystore
if [[ -f password.txt ]]; then
	password=$(cat password.txt)
	echo "Read existing password from password.txt"
else
	echo "Type password for keystore."
	echo "Note that the password should be same across all nodes for benchmark scripts to work." 
	echo -n "Password: "
	read -s password
	echo
	echo $password > password.txt
fi

for ((i=1; i <= $1; i++)); do
	NODE_ROOT=node$i
	if [[ -d $NODE_ROOT/keystore ]]; then
		echo "keystore exists in $NODE_ROOT; skipping.."
		continue
	fi
	echo "Creating account for $NODE_ROOT.."
	geth --datadir $NODE_ROOT account new --password password.txt 2> /dev/null 
	account=$(geth --datadir $NODE_ROOT account list 2> /dev/null | sed -nE 's/.*\{([0-9a-f]+)\}.*/\1/p')
	echo $account >> accounts.txt
	port=$((30310+$i))
	rpcport=$((8500+$i))
	cat > start_node$i.sh <<-EOF
	geth --datadir node$i/ --syncmode 'full' --port $port --targetgaslimit 94000000 \
        --rpc --rpcaddr 'localhost' --rpcport $rpcport --rpcapi 'personal,db,eth,net,web3,txpool,miner' \
        --bootnodes 'enode://$boot_enode@127.0.0.1:30310' \
        --networkid $NETWORK_ID --gasprice '1' \
        -unlock '0x$account' --password password.txt --mine
	EOF
	chmod +x start_node$i.sh
done
