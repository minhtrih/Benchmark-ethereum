// Account list

var node1 = "0x909913a250c7087d426c20b46b913d4dd9b526a8";
var node2 = "0x42246e58c85037f28177254f352fee4f2bd792ff";


// Some function to make life easier

function getBalance(acc)
{
    return web3.fromWei(eth.getBalance(acc));
}

function crazySend(value){
        for(i=0; i<value; i++){
                send(1);
        }
}


function send(value)
{
	if (eth.coinbase==node1) {
			return eth.sendTransaction({
        		"from" : eth.coinbase,
        		"to" : node2,
        		"value" : web3.toWei(value, "ether")
        	});
	} else {
		 	return eth.sendTransaction({
       			"from" : eth.coinbase,
        		"to" : node1,
        		"value" : web3.toWei(value, "ether")
       		});
	}
}

function sendTransaction(to, value)
{
    return eth.sendTransaction({
        "from" : eth.coinbase,
        "to" : to,
        "value" : web3.toWei(value, "ether")
        });
}
