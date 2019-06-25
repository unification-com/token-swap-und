var express = require('express');
var router = express.Router();

var util=require('../util');
var db=require('../db');
let eth=require("../eth");
/* GET home page. */
let config=require('../config');
router.get('/', function(req, res, next) {
  res.render('index',{ "error": null });
});

router.get('/status', function(req, res, next) {
  res.render('checkstatus',{ "error": null });
});

router.post('/status', async function(req, res, next) {
  let valid=true;
  let error={};
  if(!req.body["sendaddress"]){
    valid=false;
    error["sendaddress"]="Please enter your ETH sending Address";
  }
  if(valid){
      let address=req.body["sendaddress"]
      let transactions = await eth.getTransactionsForAddress(address);
      res.render('txlist',{ "error": null ,transactions:transactions});
  }
  else{
    res.render('checkstatus',{ "error": error});
  }
});

router.get('/step2',async(req, res, next) => {
  if(!req.session["sendaccount"]){
    res.redirect('/');
  }
  else{
      let swapWallet = config.network=="testnet" ? config.ethereum.testnet.swapWallet :  config.ethereum.mainnet.swapWallet;
      let sendaccount= req.session["sendaccount"];
      let accountExists=await db.accountExists(sendaccount);
      if(!accountExists){
        res.redirect('/');
      }
      let account=await db.getAccount(sendaccount);
      res.render('step2',{ "error": null,"account":account,swapWallet:swapWallet});
  }
});

router.get('/step3', function(req, res, next) {
    res.render('step3',{});
});

router.post('/', async(req, res, next) => {
  let valid=true;
  let error={};
  if(!req.body["sendaddress"]){
    valid=false;
    error["sendaddress"]="Please enter your ETH sending Address";
  }
  if(!req.body["destaddress"]){
    valid=false;
    error["destaddress"]="Please enter your BNB Address";
  }
  let ethAddr=req.body["sendaddress"];
  let bnbAddr=req.body["destaddress"];
  if(valid){
     if(!util.validateEthAddress(ethAddr)){
       valid=false;
       error["sendaddress"]="Invalid sending ETH address";
     }
     if(!util.validateBNBAddress(bnbAddr)){
       valid=false;
       error["destaddress"]="Invalid sending BNB address";
     }
  }
  if(!valid){
    res.render('index', { "error": error });
  }
  else{
    let accountExists = await db.accountExists(ethAddr);
    if(!accountExists){
      let newAccount = await db.createAccount(ethAddr,bnbAddr);
      if(newAccount){
        req.session["sendaccount"]=ethAddr;
        res.redirect("/step2");
      }
      else{
          res.render("index",{ "error": {generalerror:"There was an error processing your request."} });
      }
    }
    else{
      req.session["sendaccount"]=ethAddr;
      res.redirect("/step2");
    }
  }
});
module.exports = router;
