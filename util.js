let config=require("./config.json");
const BNBApiClient = require('@binance-chain/javascript-sdk');
const Web3 = require('web3');

let BNBApiUrl="";
let bNBNetwork = null;
let ethRpcServer = null;
if(config.network=="testnet"){
  BNBApiUrl=config.binanceChain.testnet.apiServer;
  ethRpcServer=config.ethereum.testnet.rpcServer;
}
else{
  BNBApiUrl=config.binanceChain.mainet.apiServer;
  ethRpcServer=config.ethereum.mainet.rpcServer;
}

const BNBClient = new BNBApiClient(BNBApiUrl);
BNBClient.chooseNetwork(config.network);
const web3 = new Web3(ethRpcServer, null, {});
let validateBNBAddress = (address) =>{
  try {
    return BNBClient.checkAddress(address)
  }
  catch(e){
    return null;
  }
};
let validateEthAddress = (address) => {
  return web3.utils.isAddress(address);
}
module.exports={
  "validateBNBAddress":validateBNBAddress,
  "validateEthAddress":validateEthAddress
}
