var {ethers} = require("ethers");

import { isKeystoreWallet } from '@ethersproject/json-wallets';
import { isAddress } from 'ethers/lib/utils';
import 'regenerator-runtime/runtime';

var {abi} = require("../build/contracts/Transactionx.json"); 

var CONTRACT_ADDRESS = "0x769BAFaa82f13e6DE9c368080F85a2C4BA68AecD";
var PRIVATE_KEY = null;
var connected = false;

//connecting to Metamask wallet
var account = null, 
    provider = null,
    signer = null,
    provider = new ethers.providers.Web3Provider(window.ethereum),
    wallet = null;

    //requesting for account
async function connect () {

    try {

        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();

        account = await signer.getAddress();
        connected = true;
        var balance = await getBalance(account);

        document.querySelector("#balance").innerHTML = (balance + "ETH");
        document.querySelector("#marquee").innerHTML = (account);

    } catch (err) {
         
        alert("Connect to Metamask before sending your Ether"); //connect();
    
    }

};

    //current mined block
async function getCurrentBlock ()    {

    let currentBlock = await provider.getBlockNumber();
    console.log(currentBlock);

}

    //getting wallet balance
async function getBalance (account) {
    let balance = await provider.getBalance(account);
    // we use the code below to convert the balance from wei to eth
    balance = ethers.utils.formatEther(balance);
    return (balance);
}

async function initiateContract (key)
{
    PRIVATE_KEY = key;
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(account, abi, wallet);
    return contract;
}

var amount, wallet_;

function proceedTransaction ()
{
    amount = document.querySelector("#amount").value,
    wallet_ = document.querySelector("#wallet").value;

    if (!connected) {
        //alert("Connect to Metamask first");
        connect();
        return false;
    }

    if (amount == "") {
        alert("Please input amount in ETH you want to transfer");
        return false;
    }

    amount = parseFloat(amount);

    if (amount <= 0) {
      alert("Can not transfer " + amount + "ETH");
      return false;
    }

    //amount = ethers.utils.formatEther(amount); 

    if (!isAddress(wallet_)) {
        alert("Invalid wallet address");
        return false;
    }

    if (getBalance(account) < amount) {
        alert("Insufficient balance");
        return false;
    }

}

window.onload = async () => {

    connect();

    document.querySelector(".input-btn").addEventListener("click", async () =>
    {
        const output = await proceedTransaction();
       
        if (typeof output === "undefined") {

           // PRIVATE_KEY = prompt("Sign this transaction with your private key");
            var log = null;

            /*
            if (PRIVATE_KEY.length < (sample.length + 5)) {
                alert("Invalid private key")
                return;
            }
            */
           
            //wallet = new ethers.Wallet(PRIVATE_KEY.toString(), provider);
            const gasPrice = provider.getGasPrice();
            //signer = wallet.connect(provider);
            signer = provider.getSigner();
            const reciever = wallet_;
            const block = await provider.getBlockNumber();
            const tx = {
                from: account,
                to: reciever.toString(),
                value: ethers.utils.parseUnits(amount.toString(), 'ether'),
                gasPrice: gasPrice,
                gasLimit: ethers.utils.parseUnits('0.00000000000003', 'ether'),
                nonce: provider.getTransactionCount(account, block)
            };

            try {
                
                const transaction = await signer.sendTransaction(tx);
                const result = await transaction.wait();

                log = result.logs;

                if (log.length == 0) {
                    alert(`You just sent ` + amount + `ETH to ` + wallet_);
                    window.location.reload();
                    return;
                }

                alert(`Unable to instantiate transaction`);

                console.log(result);

            } catch (exp) {alert("Transaction failed");}
        
    } 
        
    }, true);
    
}
