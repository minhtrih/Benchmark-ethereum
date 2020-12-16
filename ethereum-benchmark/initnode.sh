#!/bin/bash


for NODE_ROOT in node*; do
	if [[ -e $NODE_ROOT/geth ]]; then
		echo "$NODE_ROOT is already initialized; skipping.."
		continue
	fi
	geth --datadir $NODE_ROOT init genesis.json
done
