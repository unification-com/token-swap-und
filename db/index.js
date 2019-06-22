'use strict'

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const config = require('../config')
const db = {}
let Account=require("./models/account");
mongoose.Promise = global.Promise
mongoose.connect(config.db.uri, { useCreateIndex: true, useNewUrlParser: true })

db.mongoose = mongoose

db.accountExists = async (account) => {
  let result = await Account.exists({"hash":account});
  return result;
}
db.getAccount= async (account) =>{
  let result = await Account.findOne({"hash":account}).exec();
  return result;
}
db.createAccount = async(hash,destAccount) => {
  let newAccount = new Account();
  newAccount.hash=hash;
  newAccount.destination=destAccount;
  newAccount.balance="0"
  newAccount.balanceNumber=0;
  newAccount.accountType="normal";
  newAccount.processed=false;
  let result = newAccount.save();
  if(result === newAccount){
    return result;
  }
  else{
    return null;
  }
}
module.exports = db
