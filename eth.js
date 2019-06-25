'use strict'

//const db = require('./models')
const BigNumber = require('bignumber.js')

let config=require("./config.json");
const Web3 = require('web3');

let ethRpcServer = null;
if(config.network=="testnet"){
  ethRpcServer=config.ethereum.testnet.rpcServer;
}
else{
  ethRpcServer=config.ethereum.mainet.rpcServer;
}

const web3 = new Web3(ethRpcServer, null, {});

const ABI = require('./tokens/StandardERC20');

let startBlock = config.startBlock;
let endBlock = config.endBlock;

BigNumber.config({ EXPONENTIAL_AT: [-100, 100] });

let eth={};
eth.getTransactionsForAddress =  async (sendaddress)=> {
    let contractAddress = config.network=="testnet"?
      config.ethereum.testnet.contractAddress :
      config.ethereum.mainet.contractAddress;

    let swapWallet = config.network=="testnet"?
        config.ethereum.testnet.swapWallet :
        config.ethereum.mainet.swapWallet;
    let Token = new web3.eth.Contract(ABI,contractAddress);
    let events=await Token.getPastEvents('Transfer', { fromBlock: startBlock, toBlock: endBlock })

    let transactions = [];
    events.forEach((event) => {
        if (event.event === 'Transfer' &&
          event.returnValues.from.toLowerCase() == sendaddress.toLowerCase() &&
          event.returnValues.to.toLowerCase() == swapWallet.toLowerCase()
       ) {
            let blockNumber = event.blockNumber
            let transactionHash = event.transactionHash
            let fromWallet = event.returnValues.from
            let toWallet = event.returnValues.to
            let tokenAmount = new BigNumber(event.returnValues.value)

            let tx= {
                hash: transactionHash,
                block: blockNumber,
                fromAccount: fromWallet.toLowerCase(),
                toAccount: toWallet.toLowerCase(),
                amount: tokenAmount.toString(),
                amountNumber: tokenAmount.dividedBy(10 ** 18).toNumber(),
            }

            transactions.push(tx);
        }
    })
    return transactions;
}
module.exports=eth;
