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
let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

BigNumber.config({ EXPONENTIAL_AT: [-100, 100] })
async function run (start, end) {
    if (end > endBlock) {
        end = endBlock
    }
    let contractAddress = config.network=="testnet"?
      config.ethereum.testnet.contractAddress :
      config.ethereum.mainet.contractAddress;
    let Token = new web3.eth.Contract(ABI,contractAddress);
    return Token.getPastEvents('Transfer', { fromBlock: start, toBlock: end }).then(async (events) => {
        console.log(events);
        console.log('There are %s events from block %s to %s', events.length, start, end)
        let map = events.map(async function (event) {
            if (event.event === 'Transfer') {
                let blockNumber = event.blockNumber
                let transactionHash = event.transactionHash
                let fromWallet = event.returnValues.from
                let toWallet = event.returnValues.to
                let tokenAmount = new BigNumber(event.returnValues.value)

                return {
                    hash: transactionHash,
                    block: blockNumber,
                    fromAccount: fromWallet.toLowerCase(),
                    toAccount: toWallet.toLowerCase(),
                    amount: tokenAmount.toString(),
                    amountNumber: tokenAmount.dividedBy(10 ** 18).toNumber(),
                    isProcess: false
                }
            }
        })
        return Promise.all(map)
    }).then(data => {
        if (data.length > 0) {
            //return db.Transaction.insertMany(data)
        }
    }).catch(async (e) => {
        await sleep(2000)
        console.log(e);
        console.log('Error when crawl', start, end)
        console.log('Sleep 2 seconds, Re-crawl', start, end)
        return run(start, end)
    })
}

async function main () {
  let i;
    for (i = startBlock; i < endBlock; i += 1000) {
        let end = i + 1000 - 1
        if (end > endBlock) {
            end = endBlock
        }
        await run(i, end)
    }
    if (i >= endBlock) {
        console.log('Get all transactions is done. Waiting 5 seconds to finish')
        await sleep(5000)
        process.exit(0)
    }
}

main()
