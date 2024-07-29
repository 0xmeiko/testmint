const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const { logSuccess, logError } = require('./src/utils');
const { createWallet, getAddress } = require('./src/wallet');
const { provider, PRIVATE_KEY, CONTRACT_ADDRESS } = require('./src/config');
const NFT_DATA = JSON.parse(fs.readFileSync('nftdata.json', 'utf-8'));

async function Mintnft(datanfthex) {
   
    try {
        const walletAddress = getAddress(PRIVATE_KEY, provider);
        console.log(`Using wallet address: ${walletAddress}`.yellow);
        const wallet = createWallet(PRIVATE_KEY, provider);
        const transactionData = datanfthex;
        try {
            console.log('Preparing transaction...'.yellow);
            const nonce = await wallet.getNonce();
            const feeData = await wallet.provider.getFeeData();
            const gasLimit = await wallet.estimateGas({
              data: transactionData,
              to: CONTRACT_ADDRESS,
            });
            const gasPrice = feeData.gasPrice;
    
            const transaction = {
              data: transactionData,
              to: CONTRACT_ADDRESS,
              gasLimit,
              gasPrice,
              nonce,
              value: 0,
            };
    
            console.log('Sending transaction...'.yellow);
            const result = await wallet.sendTransaction(transaction);
            logSuccess(result.from, result.hash);
            console.log('waiting nonce 10 seconds...');
            await delay(10000);
          } catch (error) {
            logError(error);
          }

} catch (error) {
    console.log(
      `[${moment().format('HH:mm:ss')}] Critical error: ${error.message}`.red
    );
  }
}

async function runCheckIn() {
    for (const nftdata of NFT_DATA) {
      try {
        const nftid = nftdata;
        await Mintnft(nftid);
      } catch (error) {
        console.log(`[${moment().format('HH:mm:ss')}] Error: ${error}`.red);
      }
    }
  }

runCheckIn();
