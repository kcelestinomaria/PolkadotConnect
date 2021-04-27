const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // Initialize accounts from the mnemonic
  const account = keyring.addFromUri(process.env.MNEMONIC);
  const proxyAccount = keyring.addFromUri(process.env.PROXY_MNEMONIC);

    // Get number of proxies for the given address
    // The [proxies] array is being populated with the api.query.proxy.proxies() call. We are passing in our account address and asking the Polkadot API to report to us any proxies related to our account.
//proxies.length is referring to the length of the array, so if we were to add several more proxy accounts in the future, we would expect this number to increase.
  const [proxies] = await api.query.proxy.proxies(account.address);
  console.log(`# of proxies for address ${account.address}`, proxies.length);
  console.log(`proxyDepositBase: ${api.consts.proxy.proxyDepositBase}`);
  console.log(`proxyDepositFactor: ${api.consts.proxy.proxyDepositFactor}`);

    // calculate the amount that needs to be deposited in each proxy
    // api.consts.proxy is the API interface to look at the constants defined in the Polkadot spec for proxy accounts. Specifically we are going to look at the proxyDepositBase and the proxyDepositFactor . Why will become clear in a moment.

    // There is the matter of a required deposit for any of our proxy accounts, thus we will calculate the requiredDeposit by adding the proxyDepositBase to the proxtDepositFactor and multiplying that by the length of the proxies array. Remember that the length of this array is going to be equal to the number of proxy accounts we have defined
  const requiredDeposit = api.consts.proxy.proxyDepositBase + api.consts.proxy.proxyDepositFactor * proxies.length;
  console.log(`Required deposit for creating proxy: ${requiredDeposit}`);

    // Add a staking proxy
    // The extrinsic .addProxy() is going to take in our proxyAccount.address , the Staking proxyType, with a delay of 0 . Finally, we will need to method chain the .signAndSend() call, passing in our account. This accomplishes precisely what it says : signing the .addProxy() extrinsic, then sending the transaction to the network. For convenience, we will generate a link to view the transaction on the SubScan block explorer.
  const proxyType = 'Staking';
  const delay = 0;
  let txHash = await api.tx.proxy
    .addProxy(proxyAccount.address, proxyType, delay)
    .signAndSend(account);
  console.log(`.addProxy() tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => {
  console.error(err);
}).finally(() => process.exit());
