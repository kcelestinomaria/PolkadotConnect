/* Before we can transfer any value on Westend, we will need to acquire some WND tokens from a faucet. These tokens are free, have no monetary value & cannot be traded for any token that does have value, even unintentionally. Being able to test token transfers and interact with core functionality before going to production is a vital part of the blockchain development process. For this, we must have sufficient funding in our accounts to pay network fees and meet the existential deposit.

WND tokens can be obtained from the Figment Learn faucet or the official Polkadot faucet - however the official faucet only releases 1 WND per user, per day. Go to https://faucet.figment.io/, sign in with a DataHub account and then copy/paste the address we generated in the step 2 into the text input (this address should be stored in the .env file) :

*/


const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});
    // Above, we are using wsProvider, api and keyring to initialze our //connection to Datahub and manage our keyring
    
  const AMOUNT = 100000000000; // 1/10 of a WND
  const RECIPIENT_ADDRESS = '5GhDUqe4PkSGM4GDjJFF7dD8J1LRMjYMWJbwk73acourfEGN'

  // Initialize account from the mnemonic
  const account = keyring.addFromUri(process.env.MNEMONIC);

  // Retrieve account from the address
  const now = await api.query.timestamp.now();
  const { data: balance } = await api.query.system.account(process.env.ADDRESS);
  console.log(`${account.address} has a balance of ${balance.free} at timestamp: ${now}`);

  // Transfer tokens
  const txHash = await api.tx.balances
    .transfer(RECIPIENT_ADDRESS, AMOUNT)
    .signAndSend(account);

  // Go to https://westend.subscan.io/extrinsic/<TxHash> to check your transaction
  console.log(`Transaction hash: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => {
  console.error(err);
}).finally(() => process.exit());

/*More information on the available extrinsic functions for Substrate compatible blockchains can be found in the Polkadot API docs. */
