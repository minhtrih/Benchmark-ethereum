#!/bin/bash


echo "Before continuing, ensure the nodes are fully stopped!"
echo -n "Press enter to continue: "
read

for NODE_ROOT in node*; do
	if [[ -e $NODE_ROOT/geth.ipc ]]; then
		echo "Error: $NODE_ROOT is still running." >&2 
		echo "Ensure all nodes are stopped and try again." >&2
		exit 63
	fi
done

for NODE_ROOT in node*; do
	rm -rf $NODE_ROOT/geth
	geth --datadir $NODE_ROOT init genesis.json
done
