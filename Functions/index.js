const functions = require("firebase-functions");
const admin = require('firebase-admin');
const TronWeb = require('tronweb');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const abiDecoderERC20 = require('abi-decoder');
const abiDecoderBSC20 = require('abi-decoder');
const generateApiKey = require('generate-api-key').default;

const https = require('https');

let urlETHEREUM = "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
let urlBINANCE = "https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

admin.initializeApp();
const databaseRef = admin.database().ref();

const tokenERC20ABI = [
    { "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "initialAccount", "type": "address" }, { "internalType": "uint256", "name": "initialBalance", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32" }], "name": "RoleAdminChanged", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }], "name": "RoleGranted", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }], "name": "RoleRevoked", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" },
    { "inputs": [], "name": "DEFAULT_ADMIN_ROLE", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "MINTER_ROLE", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "PAUSER_ROLE", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }], "name": "getRoleAdmin", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "getRoleMember", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }], "name": "getRoleMemberCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "hasRole", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "renounceRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const tokenBSC20ABI = [
    { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
    { "constant": true, "inputs": [], "name": "_decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": true, "inputs": [], "name": "_name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": true, "inputs": [], "name": "_symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": false, "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
];

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { "TRON-PRO-API-KEY": 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }
})
const web3ETH = new Web3('https://eth-mainnet.g.alchemy.com/v2/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
const web3BSC = new Web3('https://bsc-dataseed1.binance.org:443');

const contractUSDT = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const contractBscUSDT = "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const contractEthUSDT = "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
tronWeb.setAddress('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

var bscContract = new web3BSC.eth.Contract(tokenBSC20ABI, contractBscUSDT);
var ethContract = new web3ETH.eth.Contract(tokenERC20ABI, contractEthUSDT);
abiDecoderERC20.addABI(tokenERC20ABI);
abiDecoderBSC20.addABI(tokenBSC20ABI);

function toFixed(x) {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x;
};

function isAlphaNumeric(str) {
    var code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && !(code > 96 && code < 123) && !(code == 45) && !(code == 95)) {
            return false;
        }
    }
    return true;
};

function toGwei(stringParam) {
    if (stringParam.length > 9) {
        var newString = '';
        for (var i = 0; i < stringParam.length - 9; i++) {
            newString += stringParam[i];
        }
        return newString;
    } else {
        return '0';
    }
};

function isNumeric(str) {
    var code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && !(code == 46)) {
            return false;
        }
    }
    return true;
};

function generate4Digit() {
    var theValue = Math.random() * 10000;
    return makeIt4Digit(theValue);
}

function makeIt4Digit(paramValue) {
    if (paramValue > 1000) {
        return parseInt(paramValue);
    } else {
        return makeIt4Digit(paramValue *= 10);
    }
}

function generatePrivateKey() {
    var newValue = '';
    newValue += generate4Digit();
    newValue += generate4Digit();
    newValue += generate4Digit();
    newValue += generate4Digit();
    return newValue;
}

// firebase deploy --only functions:onWriteTenSecondNotification
exports.onWriteTenSecondNotification = functions.database.ref('/accounts/{accnountID}/readable/tenSecondNotification')
    .onWrite((change, context) => {
        if (change.after.exists()) {
            var data = change.after._data;
            // console.log(data)
            setTimeout(() => {
                return databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').remove().then(() => {
                    var timestamp = data.timestamp;
                    var message = data.message;
                    var uid = context.params.accnountID;
                    var success = data.success;
                    databaseRef.child('forAdmin').child('tenSecondNotification').child(timestamp).set({ uid: uid, message: message, timestamp: timestamp, success: success });
                })
            }, 10000)
        }
    })

// firebase deploy --only functions:onCreateAccount
exports.onCreateAccount = functions.auth.user()
    .onCreate(event => {
        var d = new Date();
        var n = d.getTime();
        const uidAccount = event.uid;
        const emailAccount = event.email;
        return tronWeb.createAccount().then(accountTRC2Object => {
            var accountERC2Object = (web3ETH.eth.accounts.create());
            var accountBSC2Object = (web3BSC.eth.accounts.create());
            databaseRef.child('accounts').child(uidAccount).set({
                public: {
                    email: emailAccount
                },
                readable: {
                    email: emailAccount,
                    ethAddress: accountERC2Object.address,
                    bscAddress: accountBSC2Object.address,
                    trcAddress: accountTRC2Object.address.base58,
                    situation: 'ready',
                    walletActivated: false,
                    busy: false
                },
                unreadable: {
                    ethPrivateKey: accountERC2Object.privateKey,
                    bscPrivateKey: accountBSC2Object.privateKey,
                    trcPrivateKey: accountTRC2Object.privateKey
                }
            }).then(() => {
                databaseRef.child('ethUserAccounts').child(uidAccount).set(accountERC2Object.address);
                databaseRef.child('bscUserAccounts').child(uidAccount).set(accountBSC2Object.address);
                databaseRef.child('trcUserAccounts').child(uidAccount).set(accountTRC2Object.address.base58);
                databaseRef.child('ethWalletUsers').child(accountERC2Object.address.toLowerCase()).set(uidAccount);
                databaseRef.child('bscWalletUsers').child(accountBSC2Object.address.toLowerCase()).set(uidAccount);
                databaseRef.child('trcWalletUsers').child(accountTRC2Object.address.base58).set(uidAccount);
            }).then(() => {
                databaseRef.child('forAdmin').child('newUsers').child(n).set({ email: emailAccount, uid: uidAccount });
            })
        });
    })

// firebase deploy --only functions:onDeleteAccount
exports.onDeleteAccount = functions.auth.user()
    .onDelete(event => {
        var d = new Date();
        var n = d.getTime();
        console.log(n)
        const uidAccount = event.uid;
        const emailAccount = event.email;
        console.log(uidAccount, emailAccount);
        return databaseRef.child('accounts').child(uidAccount).once('value', userAccountSnapshot => {
            var accnountData = userAccountSnapshot.val();
            var readable = accnountData.readable;
            if (readable.username) {
                var username = readable.username;
                databaseRef.child('usernames').child(username).remove();
                databaseRef.child('uidusername').child(uidAccount).remove();
            }
            var trcAddress = readable.trcAddress;
            var bscAddress = readable.bscAddress;
            var ethAddress = readable.ethAddress;
            databaseRef.child('trcWalletUsers').child(trcAddress).remove();
            databaseRef.child('trcUserAccounts').child(uidAccount).remove();
            databaseRef.child('ethWalletUsers').child(ethAddress.toLowerCase()).remove();
            databaseRef.child('ethUserAccounts').child(uidAccount).remove();
            databaseRef.child('bscWalletUsers').child(bscAddress.toLowerCase()).remove();
            databaseRef.child('bscUserAccounts').child(uidAccount).remove();
            databaseRef.child('accounts').child(uidAccount).remove();
            databaseRef.child('archive').child('deletedAccounts').child(uidAccount).set(accnountData);
        })
    })

// firebase deploy --only functions:checkupEverything
exports.checkupEverything = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        tronWeb.trx.getCurrentBlock().then(result => {
            if (result) {
                console.log(result.block_header.raw_data.number);
                currentBlockLocal = result.block_header.raw_data.number;
                databaseRef.child('privateSettings').child('tronCurrentBlock').once('value', tronCurrentBlockSnapshot => {
                    // if (parseInt(tronCurrentBlockSnapshot.val()) + 100 < parseInt(currentBlockLocal)) {
                    //     console.log("error");
                    //     databaseRef.child('publicSettings').child('usdtifyBlock').child('status').set(true);
                    // }
                })
            }
            else {
                console.log("error on tron web");
            }
        });
        return 0;
    })

// firebase deploy --only functions:onRequestCreateUserName
exports.onRequestCreateUserName = functions.database.ref('/requests/createUserName/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestCreateUserName').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestCreateUserName').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                if (semiOriginal['username']) {
                    var original = semiOriginal['username'];
                    if (isAlphaNumeric(original)) {
                        var realNewCreateUserName = original.toLowerCase();
                        databaseRef.child('publicSettings').child('forbidden').child(realNewCreateUserName).once('value', forbiddenSnapshot => {
                            if (forbiddenSnapshot.val()) {
                                return databaseRef.child('/requests/createUserName/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.usernameIsForbidden.message, timestamp: n, success: false });
                                })
                            } else {
                                databaseRef.child('usernames').child(realNewCreateUserName).once('value', existingUserNameSnapshot => {
                                    if (existingUserNameSnapshot.val()) {
                                        return databaseRef.child('/requests/createUserName/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.usernameAlreadyExists.message, timestamp: n, success: false });
                                        })
                                    } else {
                                        return databaseRef.child('accounts/' + context.params.accnountID + '/readable/email').once('value', emailSnapshot => {
                                            var email = emailSnapshot.val();
                                            databaseRef.child('usernames/' + realNewCreateUserName + '/uid').set(context.params.accnountID).then(() => {
                                                databaseRef.child('usernames/' + realNewCreateUserName + '/email').set(email).then(() => {
                                                    databaseRef.child('usernames/' + realNewCreateUserName + '/username').set(realNewCreateUserName).then(() => {
                                                        databaseRef.child('uidusername/' + context.params.accnountID).set(realNewCreateUserName).then(() => {
                                                            databaseRef.child('accounts/' + context.params.accnountID + '/readable/username').set(realNewCreateUserName).then(() => {
                                                                databaseRef.child('accounts/' + context.params.accnountID + '/public/username').set(realNewCreateUserName).then(() => {
                                                                    databaseRef.child('/requests/createUserName/' + context.params.accnountID).remove().then(() => {
                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {
                                                                            databaseRef.child('forAdmin').child('newUsernames').child(n).set({ email: email, uid: context.params.accnountID, username: realNewCreateUserName });
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        databaseRef.child('/requests/createUserName/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.usernameNonAlphanumeric.message, timestamp: n, success: false });
                        });
                    }
                } else {
                    databaseRef.child('/requests/createUserName/' + context.params.accnountID).remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.usernameNonAlphanumeric.message, timestamp: n, success: false });
                    });
                }
            });
        });
    })

// firebase deploy --only functions:onRequestEditBlurb
exports.onRequestEditBlurb = functions.database.ref('/requests/editBlurb/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestEditBlurb').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['blurb']) {
                var original = semiOriginal['blurb'];
                databaseRef.child('accounts/' + context.params.accnountID + '/readable/blurb').set(original).then(() => {
                    databaseRef.child('accounts/' + context.params.accnountID + '/public/blurb').set(original).then(() => {
                        databaseRef.child('/requests/editBlurb/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {})
                        })
                    })
                })
            } else {
                databaseRef.child('/requests/editBlurb/' + context.params.accnountID).remove().then(() => {});
            }
        })
    })

// firebase deploy --only functions:onRequestEditPhoneNumber
exports.onRequestEditPhoneNumber = functions.database.ref('/requests/editPhoneNumber/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestEditPhoneNumber').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['phonenumber']) {
                var original = semiOriginal['phonenumber'];
                databaseRef.child('accounts/' + context.params.accnountID + '/readable/phonenumber').set(original).then(() => {
                    databaseRef.child('accounts/' + context.params.accnountID + '/public/phonenumber').set(original).then(() => {
                        databaseRef.child('/requests/editPhoneNumber/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {})
                        })
                    })
                })
            } else {
                databaseRef.child('/requests/editPhoneNumber/' + context.params.accnountID).remove().then(() => {});
            }
        })
    })

// firebase deploy --only functions:onRequestEditDisplayName
exports.onRequestEditDisplayName = functions.database.ref('/requests/editDisplayName/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestEditDisplayName').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['displayname']) {
                var original = semiOriginal['displayname'];
                databaseRef.child('accounts/' + context.params.accnountID + '/readable/displayname').set(original).then(() => {
                    databaseRef.child('accounts/' + context.params.accnountID + '/public/displayname').set(original).then(() => {
                        databaseRef.child('/requests/editDisplayName/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {})
                        })
                    })
                })
            } else {
                databaseRef.child('/requests/editDisplayName/' + context.params.accnountID).remove().then(() => {});
            }
        })
    })

// firebase deploy --only functions:onRequestEditFullName
exports.onRequestEditFullName = functions.database.ref('/requests/editFullName/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestEditFullName').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['fullname']) {
                var original = semiOriginal['fullname'];
                databaseRef.child('accounts/' + context.params.accnountID + '/readable/fullname').set(original).then(() => {
                    databaseRef.child('accounts/' + context.params.accnountID + '/public/fullname').set(original).then(() => {
                        databaseRef.child('/requests/editFullName/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {})
                        })
                    })
                })
            } else {
                databaseRef.child('/requests/editFullName/' + context.params.accnountID).remove().then(() => {});
            }
        })
    })

// firebase deploy --only functions:onRequestEditAddress
exports.onRequestEditAddress = functions.database.ref('/requests/editAddress/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestEditAddress').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['address']) {
                var original = semiOriginal['address'];
                databaseRef.child('accounts/' + context.params.accnountID + '/readable/address').set(original).then(() => {
                    databaseRef.child('accounts/' + context.params.accnountID + '/public/address').set(original).then(() => {
                        databaseRef.child('/requests/editAddress/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {})
                        })
                    })
                })
            } else {
                databaseRef.child('/requests/editAddress/' + context.params.accnountID).remove().then(() => {});
            }
        })
    })

// firebase deploy --only functions:onRequestEditCity
exports.onRequestEditCity = functions.database.ref('/requests/editCity/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestEditCity').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['city']) {
                var original = semiOriginal['city'];
                databaseRef.child('accounts/' + context.params.accnountID + '/readable/city').set(original).then(() => {
                    databaseRef.child('accounts/' + context.params.accnountID + '/public/city').set(original).then(() => {
                        databaseRef.child('/requests/editCity/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {})
                        })
                    })
                })
            } else {
                databaseRef.child('/requests/editCity/' + context.params.accnountID).remove().then(() => {});
            }
        })
    })

// firebase deploy --only functions:onRequestEditCountry
exports.onRequestEditCountry = functions.database.ref('/requests/editCountry/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestEditCountry').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['country']) {
                var original = semiOriginal['country'];
                databaseRef.child('publicSettings').child('countries').child(original).once('value', countrySnapshot => {
                    if (countrySnapshot.val()) {
                        var countryObject = countrySnapshot.val();
                        var code = countryObject.code;
                        var name = countryObject.name;
                        var restricted = countryObject.restricted;
                        databaseRef.child('accounts/' + context.params.accnountID + '/readable').update({ countryCode: code, countryName: name }).then(() => {
                            databaseRef.child('accounts/' + context.params.accnountID + '/public').update({ countryCode: code, countryName: name }).then(() => {
                                databaseRef.child('/requests/editCountry/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {})
                                })
                            })
                        })
                    } else {}
                })
            } else {
                databaseRef.child('/requests/editCountry/' + context.params.accnountID).remove().then(() => {});
            }
        })
    })

// firebase deploy --only functions:onUpdateUserPublic
exports.onUpdateUserPublic = functions.database.ref('/accounts/{accnountID}/public')
    .onWrite((change, context) => {
        if (change.after.exists()) {
            var original = change.after.val();
            databaseRef.child('forAdmin').child('usersPublic').child(context.params.accnountID).set(original);
        }
    })

// firebase deploy --only functions:onUpdateUserBusy
exports.onUpdateUserBusy = functions.database.ref('/accounts/{accnountID}/readable/busy')
    .onWrite((change, context) => {
        var d = new Date();
        var n = d.getTime();
        if (change.after.exists()) {
            var original = change.after.val();
            if (original == true) {
                databaseRef.child('forAdmin').child('usersStatus').child(context.params.accnountID).set({ status: true, timestamp: n });
                databaseRef.child('forAdmin').child('usersBusy').child(context.params.accnountID).set({ status: true, timestamp: n });
            } else {
                databaseRef.child('forAdmin').child('usersStatus').child(context.params.accnountID).set({ status: false, timestamp: n });
                databaseRef.child('forAdmin').child('usersBusy').child(context.params.accnountID).remove();
            }
        }
    })

// firebase deploy --only functions:onRequestRechargePrepaidCard
exports.onRequestRechargePrepaidCard = functions.database.ref('/requests/rechargePrepaidCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestRechargePrepaidCard').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestRechargePrepaidCard').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                    if (usdtifyBlockSnapshot.val() != true) {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                            if (!walletActionsSnapshot.val()) {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                    if (busySnapshot.val() != true) {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                                            if (semiOriginal['code']) {
                                                var original = semiOriginal['code'];
                                                if (original.length == 18) {
                                                    if (original[0] == 'U' && original[1] == 'x') {
                                                        databaseRef.child('system').child('rechargePrepaidCard').child(original).set({ uid: context.params.accnountID, language: mainLanguage }).then(() => {
                                                            databaseRef.child('/requests/rechargePrepaidCard/' + context.params.accnountID).remove();
                                                        })
                                                    }
                                                } else {
                                                    databaseRef.child('/requests/rechargePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badCodeFormat.message, timestamp: n, success: false });
                                                    });
                                                }
                                            } else {
                                                databaseRef.child('/requests/rechargePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badCodeFormat.message, timestamp: n, success: false });
                                                });
                                            }
                                        })
                                    } else {
                                        databaseRef.child('/requests/rechargePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                        });
                                    }
                                })
                            } else {
                                databaseRef.child('/requests/rechargePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                });
                            }
                        })
                    } else {
                        databaseRef.child('/requests/rechargePrepaidCard/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                        });
                    }
                })
            })
        })
    })

// firebase deploy --only functions:onSystemRechargePrepaidCard
exports.onSystemRechargePrepaidCard = functions.database.ref('/system/rechargePrepaidCard/{codeID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestRechargePrepaidCard').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            if (semiOriginal['uid']) {
                var original = semiOriginal['uid'];
                console.log(original);
                databaseRef.child('prepaidCards').child(context.params.codeID).once('value', prepaidCardSnapshot => {
                    if (prepaidCardSnapshot.val()) {
                        var prepaidCardObject = prepaidCardSnapshot.val();
                        console.log(prepaidCardObject.toString());
                        if (prepaidCardObject.blocked == true) {
                            databaseRef.child('/system/rechargePrepaidCard/' + context.params.codeID).remove().then(() => {
                                databaseRef.child('accounts').child(original).child('readable').child('tenSecondNotification').set({ message: messageObject.blockedPrepaidCard.message, timestamp: n, success: false });
                            });
                        } else {
                            databaseRef.child('prepaidCards').child(context.params.codeID).remove().then(() => {
                                databaseRef.child('serialNumberPrepaidCards').child(prepaidCardObject.serialNumber).remove().then(() => {
                                    databaseRef.child('walletActions').child(original).child(n).set(prepaidCardObject.usdtValue).then(() => {
                                        databaseRef.child('accounts').child(original).child('readable').child('walletActions').child(n).set(prepaidCardObject.usdtValue).then(() => {
                                            databaseRef.child('/system/rechargePrepaidCard/' + context.params.codeID).remove().then(() => {
                                                databaseRef.child('historic').child('prepaidCards').child(context.params.codeID).set(n).then(() => {
                                                    databaseRef.child('historic').child('serialNumberPrepaidCards').child(prepaidCardObject.serialNumber).set(n).then(() => {
                                                        databaseRef.child('historic').child('transactions').child(original).child(n).set({ timestamp: n, type: 'prepaidRecharging', data: prepaidCardObject }).then(() => {
                                                            databaseRef.child('archive').child('transactions').child(n).set({ timestamp: n, type: 'prepaidRecharging', data: prepaidCardObject, uid: original }).then(() => {
                                                                databaseRef.child('accounts').child(original).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {
                                                                    if (prepaidCardObject.uid) {
                                                                        databaseRef.child('accounts').child(prepaidCardObject.uid).child('readable').child('myPrepaidCard').child(prepaidCardObject.serialNumber).remove();
                                                                    }
                                                                })
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        }
                    } else {
                        databaseRef.child('/system/rechargePrepaidCard/' + context.params.codeID).remove().then(() => {
                            databaseRef.child('accounts').child(original).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidCode.message, timestamp: n, success: false });
                        });
                    }
                })
            } else {
                databaseRef.child('/system/rechargePrepaidCard/' + context.params.coedID).remove();
            }
        })
    })

// firebase deploy --only functions:onRequestTransferUSDT
exports.onRequestTransferUSDT = functions.database.ref('/requests/transferUSDT/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestTransferUSDT').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                databaseRef.child('messages').child(mainLanguage).child('onRequestTransferUSDT').once('value', messageSnapshot => {
                    var messageObject = messageSnapshot.val();
                    if (semiOriginal['amount'] && semiOriginal['uid']) {
                        var amountData = semiOriginal['amount'];
                        var uid = semiOriginal['uid'];
                        if (uid != context.params.accnountID) {
                            if (isNumeric(amountData)) {
                                databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                                    if (usdtifyBlockSnapshot.val() != true) {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                            if (!walletActionsSnapshot.val()) {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                                    if (busySnapshot.val() != true) {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                                            if (balanceSnapshot.val()) {
                                                                var balance = parseInt(balanceSnapshot.val());
                                                                var amount = parseInt(amountData);
                                                                if (amount > 0) {
                                                                    if (balance >= amount) {
                                                                        databaseRef.child('accounts').child(uid).child('readable').child('username').once('value', receiverSnapshot => {
                                                                            if (receiverSnapshot.val()) {
                                                                                databaseRef.child('publicSettings').child('transactionFees').child('versionOne').once('value', transactionFeesVersionOneSnapshot => {
                                                                                    var transactionFeesVersionOne = 0;
                                                                                    if (transactionFeesVersionOneSnapshot.val()) {
                                                                                        transactionFeesVersionOne = parseInt(transactionFeesVersionOneSnapshot.val());
                                                                                    }
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('username').once('value', senderSnapshot => {
                                                                                        var sender = senderSnapshot.val();
                                                                                        var receiver = receiverSnapshot.val();
                                                                                        var senderAmount = '-' + amount;
                                                                                        if ((amount - transactionFeesVersionOne) > 0) {
                                                                                            var receiverAmount = '' + (amount - transactionFeesVersionOne);
                                                                                            databaseRef.child('walletActions').child(context.params.accnountID).child(n).set(senderAmount).then(() => {
                                                                                                databaseRef.child('walletActions').child(uid).child(n).set(receiverAmount).then(() => {
                                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(n).set(senderAmount).then(() => {
                                                                                                        databaseRef.child('accounts').child(uid).child('readable').child('walletActions').child(n).set(receiverAmount).then(() => {
                                                                                                            databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ timestamp: n, type: 'sendUSDT', receiver: receiver, amount: senderAmount, fees: transactionFeesVersionOneSnapshot.val() }).then(() => {
                                                                                                                databaseRef.child('historic').child('transactions').child(uid).child(n).set({ timestamp: n, type: 'receiveUSDT', sender: sender, amount: receiverAmount, fees: transactionFeesVersionOneSnapshot.val() }).then(() => {
                                                                                                                    databaseRef.child('archive').child('transactions').child(n).set({ timestamp: n, type: 'transferUSDT', sender: sender, receiver: receiver, amount: senderAmount, fees: transactionFeesVersionOneSnapshot.val() }).then(() => {
                                                                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {
                                                                                                                            databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove();
                                                                                                                        })
                                                                                                                    });
                                                                                                                });
                                                                                                            });
                                                                                                        });
                                                                                                    });
                                                                                                });
                                                                                            });
                                                                                        }
                                                                                    })
                                                                                })
                                                                            } else {
                                                                                databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidUsername.message, timestamp: n, success: false });
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                        });
                                                                    }
                                                                } else {
                                                                    databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                    });
                                                                }
                                                            } else {
                                                                databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                });
                                                            }
                                                        })
                                                    } else {
                                                        databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                        });
                                                    }
                                                })
                                            } else {
                                                databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                });
                                            }
                                        })
                                    } else {
                                        databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                        });
                                    }
                                })
                            } else {
                                databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidUsername.message, timestamp: n, success: false });
                                });
                            }
                        } else {
                            databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                            });
                        }
                    } else {
                        databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                        });
                    }
                })
            })
        });
    })

// firebase deploy --only functions:onRequestGeneratePrepaidCard
exports.onRequestGeneratePrepaidCard = functions.database.ref('/requests/generatePrepaidCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestGeneratePrepaidCard').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                databaseRef.child('messages').child(mainLanguage).child('onRequestGeneratePrepaidCard').once('value', messageSnapshot => {
                    var messageObject = messageSnapshot.val();
                    databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                        if (usdtifyBlockSnapshot.val() != true) {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                if (!walletActionsSnapshot.val()) {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                        if (busySnapshot.val() != true) {
                                            if (semiOriginal['totalAmount'] && semiOriginal['unitNumber'] && semiOriginal['unitPrice']) {
                                                var totalAmount = semiOriginal['totalAmount'];
                                                var unitNumber = semiOriginal['unitNumber'];
                                                var unitPrice = semiOriginal['unitPrice'];
                                                if ((isNumeric(totalAmount)) && (isNumeric(unitNumber)) && (isNumeric(unitPrice))) {
                                                    var totalAmountNumber = parseInt(totalAmount);
                                                    var unitNumberNumber = parseInt(unitNumber);
                                                    var unitPriceNumber = parseInt(unitPrice);
                                                    if ((totalAmountNumber > 0) && (unitNumberNumber > 0) && (unitPriceNumber > 0)) {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                                            if (balanceSnapshot.val()) {
                                                                var balance = parseInt(balanceSnapshot.val());
                                                                databaseRef.child('publicSettings').child('transactionFees').child('generatingPrepaidCard').once('value', generatingPrepaidCardsSnapshot => {
                                                                    var volumes = [];
                                                                    generatingPrepaidCardsSnapshot.forEach(generatingPrepaidCardSnapshot => {
                                                                        volumes.push(generatingPrepaidCardSnapshot.val());
                                                                    })
                                                                    console.log(volumes.length);
                                                                    var rechargePrepaidCardFees = 0;
                                                                    console.log(volumes[volumes.length - 1].to, unitNumberNumber);
                                                                    if (volumes[volumes.length - 1].to >= unitNumberNumber) {
                                                                        for (var i = 0; i < volumes.length; i++) {
                                                                            if ((unitNumberNumber >= volumes[i].from) && (unitNumberNumber <= volumes[i].to)) {
                                                                                rechargePrepaidCardFees = parseInt(volumes[i].fees)
                                                                            }
                                                                        }
                                                                        var realTotalAmount = (unitPriceNumber * unitNumberNumber) + rechargePrepaidCardFees;
                                                                        console.log(realTotalAmount);
                                                                        if (balance >= realTotalAmount) {
                                                                            var realTotalAmountString = '-' + realTotalAmount;
                                                                            databaseRef.child('walletActions').child(context.params.accnountID).child(n).set(realTotalAmountString).then(() => {
                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(n).set(realTotalAmountString).then(() => {
                                                                                    databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ timestamp: n, type: 'generateprepaidCard', amount: realTotalAmount, fees: rechargePrepaidCardFees, data: semiOriginal }).then(() => {
                                                                                        databaseRef.child('archive').child('transactions').child(n).set({ timestamp: n, type: 'generateprepaidCard', uid: context.params.accnountID, amount: realTotalAmount, fees: rechargePrepaidCardFees, data: semiOriginal }).then(() => {
                                                                                            databaseRef.child('system').child('generatePrepaidCard').child(context.params.accnountID).set({ timestamp: n, type: 'generateprepaidCard', uid: context.params.accnountID, amount: realTotalAmount, fees: rechargePrepaidCardFees, data: semiOriginal }).then(() => {
                                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.generationProcessing.message, timestamp: n, success: true });
                                                                                                databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove();
                                                                                            })
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        } else {
                                                                            databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                            });
                                                                        }
                                                                    } else {
                                                                        databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.numberOverLimit.message, timestamp: n, success: false });
                                                                        });
                                                                    }
                                                                })
                                                            } else {
                                                                databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                });
                                                            }
                                                        })
                                                    } else {
                                                        databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormat.message, timestamp: n, success: false });
                                                        });
                                                    }
                                                } else {
                                                    databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormat.message, timestamp: n, success: false });
                                                    });
                                                }
                                            } else {
                                                databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormat.message, timestamp: n, success: false });
                                                });
                                            }
                                        } else {
                                            databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                            });
                                        }
                                    })
                                } else {
                                    databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                    });
                                }
                            })
                        } else {
                            databaseRef.child('/requests/generatePrepaidCard/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                            });
                        }
                    })
                })
            })
        })
    })

// firebase deploy --only functions:onSystemGeneratePrepaidCard
exports.onSystemGeneratePrepaidCard = functions.database.ref('/system/generatePrepaidCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var generatePrepaidcardOrderObject = snapshot.val();
        var mainLanguage = 'EN';
        if (generatePrepaidcardOrderObject['data']['language']) {
            generatePrepaidcardOrderObject['data']['language'];
        }
        return databaseRef.child('messages').child(mainLanguage).child('onRequestGeneratePrepaidCard').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            var unitNumber = parseInt(generatePrepaidcardOrderObject['data']['unitNumber']);
            var unitPrice = generatePrepaidcardOrderObject['data']['unitPrice'];
            var timestamp = generatePrepaidcardOrderObject['timestamp'];
            var uid = generatePrepaidcardOrderObject['uid'];
            databaseRef.child('accounts').child(uid).child('readable').child('username').once('value', creatorUsernameSnapshot => {
                if (creatorUsernameSnapshot.val()) {
                    var username = creatorUsernameSnapshot.val();
                    for (var i = 0; i < unitNumber; i++) {
                        var aux = i + timestamp;
                        var serialNumber = 'Ux' + aux;
                        var privateKey = 'Ux' + generatePrivateKey();
                        var usdtValue = unitPrice;
                        var generated = username;
                        var blocked = false;
                        var block = 'Ux2022000000';
                        var prepaidCardObject = {
                            serialNumber: serialNumber,
                            privateKey: privateKey,
                            usdtValue: usdtValue,
                            generated: generated,
                            blocked: blocked,
                            block: block,
                            uid: uid
                        }
                        databaseRef.child('system').child('processingGeneratePrepaidCard').child(serialNumber).set(prepaidCardObject);
                    }
                    databaseRef.child('system').child('generatePrepaidCard').child(context.params.accnountID).remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                    })
                } else {
                    databaseRef.child('system').child('generatePrepaidCard').child(context.params.accnountID).remove();
                }
            })
        })
    })

// firebase deploy --only functions:onSystemProcessingGeneratePrepaidCard
exports.onSystemProcessingGeneratePrepaidCard = functions.database.ref('/system/processingGeneratePrepaidCard/{serialNumber}')
    .onCreate((snapshot, context) => {
        var prepaidCardObject = snapshot.val();
        console.log(prepaidCardObject.privateKey);
        return databaseRef.child('accounts').child(prepaidCardObject.uid).child('readable').child('myPrepaidCard').child(prepaidCardObject.serialNumber).set({ serialNumber: prepaidCardObject.serialNumber, privateKey: prepaidCardObject.privateKey, usdtValue: prepaidCardObject.usdtValue }).then(() => {
            databaseRef.child('serialNumberPrepaidCards').child(prepaidCardObject.serialNumber).set({ block: prepaidCardObject.block, blocked: prepaidCardObject.blocked, generated: prepaidCardObject.generated, serialNumber: prepaidCardObject.serialNumber, usdtValue: prepaidCardObject.usdtValue }).then(() => {
                databaseRef.child('prepaidCards').child(prepaidCardObject.privateKey).set({ block: prepaidCardObject.block, blocked: prepaidCardObject.blocked, privateKey: prepaidCardObject.privateKey, uid: prepaidCardObject.uid, generated: prepaidCardObject.generated, serialNumber: prepaidCardObject.serialNumber, usdtValue: prepaidCardObject.usdtValue }).then(() => {
                    databaseRef.child('system').child('processingGeneratePrepaidCard').child(context.params.serialNumber).remove();
                })
            })
        })
    })

// firebase deploy --only functions:checkupWalletActions
exports.checkupWalletActions = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
            if (usdtifyBlockSnapshot.val()) {
                if (usdtifyBlockSnapshot.val() == false) {
                    databaseRef.child('walletActions').once('value', walletActionsSnapshot => {
                        walletActionsSnapshot.forEach(onlineSnapshot => {
                            var userKey = onlineSnapshot.key;
                            var actions = onlineSnapshot.val();
                            var actionsKeysArray = Object.keys(actions);
                            var actionsArray = Object.values(actions);
                            console.log(userKey, actionsKeysArray[0], actionsArray[0]);
                            databaseRef.child('accounts').child(userKey).child('readable').child('auxWalletActions').set({ key: actionsKeysArray[0], data: actionsArray[0] }).then(() => {
                                databaseRef.child('walletActions').child(userKey).child(actionsKeysArray[0]).remove();
                            })
                        })
                    });
                }
            } else {
                databaseRef.child('walletActions').once('value', walletActionsSnapshot => {
                    walletActionsSnapshot.forEach(onlineSnapshot => {
                        var userKey = onlineSnapshot.key;
                        var actions = onlineSnapshot.val();
                        var actionsKeysArray = Object.keys(actions);
                        var actionsArray = Object.values(actions);
                        console.log(userKey, actionsKeysArray[0], actionsArray[0]);
                        databaseRef.child('accounts').child(userKey).child('readable').child('auxWalletActions').set({ key: actionsKeysArray[0], data: actionsArray[0] }).then(() => {
                            databaseRef.child('walletActions').child(userKey).child(actionsKeysArray[0]).remove();
                        })
                    })
                });
            }
        })
    })

// firebase deploy --only functions:onCreateAuxWalletActions
exports.onCreateAuxWalletActions = functions.database.ref('/accounts/{accnountID}/readable/auxWalletActions')
    .onCreate((snapshot, context) => {
        // console.log(context.params.accnountID, snapshot.val());
        var amount = snapshot.val().data;
        var amountRoot = snapshot.val().key;
        return databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
            if (balanceSnapshot.val()) {
                var balance = parseInt(balanceSnapshot.val());
                balance += parseInt(amount);
                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').set('' + balance).then(() => {
                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('auxWalletActions').remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(amountRoot).remove();
                    })
                })
            } else {
                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').set(amount).then(() => {
                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('auxWalletActions').remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(amountRoot).remove();
                    })
                })
            }
        })
    })

// firebase deploy --only functions:onUpdateUserBalance
exports.onUpdateUserBalance = functions.database.ref('/accounts/{accnountID}/readable/balance')
    .onWrite((change, context) => {
        if (change.after.exists()) {
            var original = change.after.val();
            console.log(context.params.accnountID, original);
            databaseRef.child('uidusername').child(context.params.accnountID).once('value', usernameSnapshot => {
                var objectData = {
                    username: '-',
                    balance: original
                }
                if (usernameSnapshot.val()) {
                    objectData.username = usernameSnapshot.val();
                }
                databaseRef.child('forAdmin').child('usersBalance').child(context.params.accnountID).set(objectData);
            })
        }
    })

// firebase deploy --only functions:checkupOnline
exports.checkupOnline = functions.pubsub.schedule('every 10 minutes')
    .onRun((context) => {
        databaseRef.child('online').once('value', onlinesSnapshot => {
            onlinesSnapshot.forEach(onlineSnapshot => {
                var userKey = onlineSnapshot.key;
                console.log(userKey);
                databaseRef.child('online').child(userKey).remove();
            })
        });
        return null;
    })

// firebase deploy --only functions:onAdminRequestGenerate100USDT
exports.onAdminRequestGenerate100USDT = functions.database.ref('/adminRequests/generate100USDT')
    .onCreate((snapshot, context) => {
        return databaseRef.child('factory').child('prepare').child('prepaidcard').child('100USDT').once('value', prepaidcard100USDTSnapshot => {
            prepaidcard100USDTSnapshot.forEach(prepaidcard100USDT => {
                var usdtValue = '100000000';
                var serialNumber = prepaidcard100USDT.val().serialNumber;
                var block = prepaidcard100USDT.val().block;
                var privateKey = prepaidcard100USDT.key;
                var prepaidCardObject = {
                    usdtValue: '100000000',
                    serialNumber: prepaidcard100USDT.val().serialNumber,
                    block: prepaidcard100USDT.val().block,
                    blocked: true,
                    privateKey: prepaidcard100USDT.key,
                    generated: 'USDTIFY'
                }
                var serialNumberObject = {
                    usdtValue: '100000000',
                    serialNumber: prepaidcard100USDT.val().serialNumber,
                    block: prepaidcard100USDT.val().block,
                    blocked: true,
                    generated: 'USDTIFY'
                }
                console.log(privateKey, block, serialNumber, usdtValue);
                databaseRef.child('prepaidCards').child(privateKey).set(prepaidCardObject).then(() => {
                    databaseRef.child('serialNumberPrepaidCards').child(serialNumber).set(serialNumberObject).then(() => {
                        databaseRef.child('factory').child('prepare').child('prepaidcard').child('100USDT').child(privateKey).remove();
                    })
                })
            });
        }).then(() => {
            databaseRef.child('adminRequests').child('generate100USDT').remove();
        })
    })

// firebase deploy --only functions:onAdminRequestUnblockBlock
exports.onAdminRequestUnblockBlock = functions.database.ref('/adminRequests/unblockBlock')
    .onCreate((snapshot, context) => {
        var paramBlock = snapshot.val();
        return databaseRef.child('prepaidCards').once('value', prepaidCardsSnapshot => {
            prepaidCardsSnapshot.forEach(prepaidCardSnapshot => {
                if (prepaidCardSnapshot.val().block == paramBlock) {
                    databaseRef.child('prepaidCards').child(prepaidCardSnapshot.key).child('blocked').set(false);
                }
            })
        }).then(() => {
            databaseRef.child('serialNumberPrepaidCards').once('value', serialNumberPrepaidCardsSnapshot => {
                serialNumberPrepaidCardsSnapshot.forEach(serialNumberSnapshot => {
                    if (serialNumberSnapshot.val().block == paramBlock) {
                        databaseRef.child('serialNumberPrepaidCards').child(serialNumberSnapshot.key).child('blocked').set(false);
                    }
                })
            })
        }).then(() => {
            databaseRef.child('adminRequests').child('unblockBlock').remove();
        })
    })

// firebase deploy --only functions:onAdminRequestBlockBlock
exports.onAdminRequestBlockBlock = functions.database.ref('/adminRequests/blockBlock')
    .onCreate((snapshot, context) => {
        var paramBlock = snapshot.val();
        return databaseRef.child('prepaidCards').once('value', prepaidCardsSnapshot => {
            prepaidCardsSnapshot.forEach(prepaidCardSnapshot => {
                if (prepaidCardSnapshot.val().block == paramBlock) {
                    databaseRef.child('prepaidCards').child(prepaidCardSnapshot.key).child('blocked').set(true);
                }
            })
        }).then(() => {
            databaseRef.child('serialNumberPrepaidCards').once('value', serialNumberPrepaidCardsSnapshot => {
                serialNumberPrepaidCardsSnapshot.forEach(serialNumberSnapshot => {
                    if (serialNumberSnapshot.val().block == paramBlock) {
                        databaseRef.child('serialNumberPrepaidCards').child(serialNumberSnapshot.key).child('blocked').set(true);
                    }
                })
            })
        }).then(() => {
            databaseRef.child('adminRequests').child('blockBlock').remove();
        })
    })

// firebase deploy --only functions:onAdminRequestDeleteBlock
exports.onAdminRequestDeleteBlock = functions.database.ref('/adminRequests/deleteBlock')
    .onCreate((snapshot, context) => {
        var paramBlock = snapshot.val();
        return databaseRef.child('prepaidCards').once('value', prepaidCardsSnapshot => {
            prepaidCardsSnapshot.forEach(prepaidCardSnapshot => {
                if (prepaidCardSnapshot.val().block == paramBlock) {
                    databaseRef.child('prepaidCards').child(prepaidCardSnapshot.key).remove();
                }
            })
        }).then(() => {
            databaseRef.child('serialNumberPrepaidCards').once('value', serialNumberPrepaidCardsSnapshot => {
                serialNumberPrepaidCardsSnapshot.forEach(serialNumberSnapshot => {
                    if (serialNumberSnapshot.val().block == paramBlock) {
                        databaseRef.child('serialNumberPrepaidCards').child(serialNumberSnapshot.key).remove();
                    }
                })
            })
        }).then(() => {
            databaseRef.child('adminRequests').child('deleteBlock').remove();
        })
    })

// firebase deploy --only functions:onRequestWithdrawTronUSDT
exports.onRequestWithdrawTronUSDT = functions.database.ref('/requests/withdrawTronUSDT/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestWithdrawTronUSDT').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                databaseRef.child('messages').child(mainLanguage).child('onRequestWithdrawTronUSDT').once('value', messageSnapshot => {
                    var messageObject = messageSnapshot.val();
                    if (semiOriginal['amount'] && semiOriginal['tronAddress']) {
                        var amountData = semiOriginal['amount'];
                        var tronAddress = semiOriginal['tronAddress'];
                        if (tronWeb.isAddress(tronAddress)) {
                            tronWeb.trx.getAccount(tronAddress).then((result) => {
                                if (isNumeric(amountData)) {
                                    databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                                        if (usdtifyBlockSnapshot.val() != true) {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                                if (!walletActionsSnapshot.val()) {
                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                                        if (busySnapshot.val() != true) {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                                                if (balanceSnapshot.val()) {
                                                                    var balance = parseInt(balanceSnapshot.val());
                                                                    var amount = parseInt(amountData);
                                                                    if (amount > 0) {
                                                                        if (balance >= amount) {
                                                                            databaseRef.child('publicSettings').child('transactionFees').child('trcWithdraw').once('value', transactionFeesTrcWithdrawSnapshot => {
                                                                                var transactionFeesTrcWithdraw = 0;
                                                                                if (transactionFeesTrcWithdrawSnapshot.val()) {
                                                                                    transactionFeesTrcWithdraw = parseInt(transactionFeesTrcWithdrawSnapshot.val());
                                                                                }
                                                                                var senderAmount = '-' + amount;
                                                                                if ((amount - transactionFeesTrcWithdraw) > 0) {
                                                                                    var receivedAmount = '' + (amount - transactionFeesTrcWithdraw);
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').set(true).then(() => {
                                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('statusWithdrawTron').set('STATUS_1').then(() => {
                                                                                            databaseRef.child('system').child('tronWithdrawRequests').child(n).set({ data: semiOriginal, uid: context.params.accnountID, receivedAmount: receivedAmount, senderAmount: senderAmount }).then(() => {
                                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.startingTransfer.message, timestamp: n, success: true }).then(() => {
                                                                                                    databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove();
                                                                                                })
                                                                                            })
                                                                                        });
                                                                                    });
                                                                                } else {
                                                                                    databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                                    });
                                                                                }
                                                                            })
                                                                        } else {
                                                                            databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                            });
                                                                        }
                                                                    } else {
                                                                        databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                        });
                                                                    }
                                                                } else {
                                                                    databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                    });
                                                                }
                                                            })
                                                        } else {
                                                            databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                            });
                                                        }
                                                    })
                                                } else {
                                                    databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                    });
                                                }
                                            })
                                        } else {
                                            databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').child(n).set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                            });
                                        }
                                    })
                                } else {
                                    databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                    });
                                }
                            }).catch((err) => {
                                databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidTronAddress.message, timestamp: n, success: false });
                                });
                            })
                        } else {
                            databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidTronAddress.message, timestamp: n, success: false });
                            });
                        }
                    } else {
                        databaseRef.child('/requests/withdrawTronUSDT/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                        });
                    }
                })
            })
        })
    })

// firebase deploy --only functions:checkupSystemWithdrawTronRequests
exports.checkupSystemWithdrawTronRequests = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('tronWithdrawRequests').once('value', tronWithdrawRequestsSnapshot => {
            var tronWithdrawRequests = [];
            tronWithdrawRequestsSnapshot.forEach(tronWithdrawRequestSnapshot => {
                tronWithdrawRequests.push({ key: tronWithdrawRequestSnapshot.key, data: tronWithdrawRequestSnapshot.val() });
            });
            console.log(tronWithdrawRequests.length);
            databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').once('value', usdtWithdrawTrcCentralWalletsSnapshot => {
                var centralWallets = [];
                usdtWithdrawTrcCentralWalletsSnapshot.forEach(usdtWithdrawTrcCentralWalletSnapshot => {
                    if (usdtWithdrawTrcCentralWalletSnapshot.val().status == 'available') {
                        centralWallets.push({ key: usdtWithdrawTrcCentralWalletSnapshot.key, data: usdtWithdrawTrcCentralWalletSnapshot.val() });
                    }
                })
                console.log(centralWallets.length);
                if (centralWallets.length <= tronWithdrawRequests.length) {
                    for (i = 0; i < centralWallets.length; i++) {
                        console.log('1: ' + centralWallets[i].key, tronWithdrawRequests[i].key);
                        if (parseInt(centralWallets[i].data.usdt) > parseInt(tronWithdrawRequests[i].data.receivedAmount)) {
                            databaseRef.child('system').child('tronWithdrawProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: tronWithdrawRequests[i] });
                            databaseRef.child('system').child('tronWithdrawRequests').child(tronWithdrawRequests[i].key).remove();
                            databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                            databaseRef.child('accounts').child(tronWithdrawRequests[i].data.uid).child('readable').child('statusWithdrawTron').set('STATUS_2');
                        } else {
                            databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                        }
                    }
                } else {
                    for (i = 0; i < tronWithdrawRequests.length; i++) {
                        if (parseInt(centralWallets[i].data.usdt) > parseInt(tronWithdrawRequests[i].data.receivedAmount)) {
                            databaseRef.child('system').child('tronWithdrawProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: tronWithdrawRequests[i] });
                            databaseRef.child('system').child('tronWithdrawRequests').child(tronWithdrawRequests[i].key).remove();
                            databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                            databaseRef.child('accounts').child(tronWithdrawRequests[i].data.uid).child('readable').child('statusWithdrawTron').set('STATUS_2');
                        } else {
                            databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                        }
                    }
                }
            })
        })
    })

// firebase deploy --only functions:onSystemWithdrawTronProcess
exports.onSystemWithdrawTronProcess = functions.database.ref('/system/tronWithdrawProcess/{key}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        async function triggercontract() {
            console.log(data.data.data.data.tronAddress, data.data.key, data.wallet.data.privateKey, data.wallet.data.publicAddress, data.wallet.key);
            var tronWebAux = new TronWeb({
                fullHost: 'https://api.trongrid.io',
                headers: { "TRON-PRO-API-KEY": '88e0b02f-034c-4ddc-8dbc-bc7afffadee1' },
                privateKey: data.wallet.data.privateKey
            })
            let withdrawInstance = await tronWebAux.contract().at(contractUSDT);
            withdrawInstance.transfer(data.data.data.data.tronAddress, parseInt(data.data.data.receivedAmount)).send({
                feeLimit: 100000000,
                callValue: 0,
                shouldPollResponse: true
            }).then((result) => {
                console.log('result:');
                databaseRef.child("system").child("tronWithdrawProcess").child(context.params.key).child("status").set('accepted');
            }).catch((error) => {
                console.log('error: ');
                databaseRef.child("system").child("tronWithdrawProcess").child(context.params.key).child("status").set('rejected');
                if (error.error) {
                    if (error.error == 'BANDWITH_ERROR') {
                        databaseRef.child("system/rejectedBandwithTronDeposit/").push(data, (err) => {
                            console.log(err);
                            console.log("Done");
                        });
                    }
                }
                if (error.transaction) {
                    if (error.transaction.txID) {
                        databaseRef.child("system/tronWithdrawTransactions/").push(error.transaction.txID, (err) => {
                            console.log(err);
                            console.log("Done");
                        });
                    }
                }
            });
        }
        triggercontract();
        return 0;
    })

// firebase deploy --only functions:onSystemTronWithdrawTransactions
exports.onSystemTronWithdrawTransactions = functions.database.ref('/system/tronWithdrawTransactions/{key}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var d = new Date();
        var n = d.getTime();
        return databaseRef.child('system').child('tronWithdrawBuffer').child(data).once('value', transactionBafferSnapshot => {
            if (!transactionBafferSnapshot.val()) {
                databaseRef.child('system').child('auxArchiveTronTransactions').child(data).once('value', auxArchiveTronTransactionSnapshot => {
                    if (!auxArchiveTronTransactionSnapshot.val()) {
                        databaseRef.child('system').child('tronWithdrawBuffer').child(data).set(data).then(() => {
                            databaseRef.child('system').child('auxArchiveTronTransactions').child(data).set(n).then(() => {
                                databaseRef.child('system').child('tronWithdrawTransactions').child(context.params.key).remove();
                            })
                        })
                    } else {
                        databaseRef.child('system').child('tronWithdrawTransactions').child(context.params.key).remove();
                    }
                })
            } else {
                databaseRef.child('system').child('tronWithdrawTransactions').child(context.params.key).remove();
            }
        })
    })

// firebase deploy --only functions:checkupSystemTronWithdrawBuffer
exports.checkupSystemTronWithdrawBuffer = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('tronWithdrawProcess').once('value', tronWithdrawProcessSnapshot => {
            var tronWithdrawProcessArray = [];
            tronWithdrawProcessSnapshot.forEach(processSnapshot => {
                var key = processSnapshot.key;
                var processData = processSnapshot.val();
                var centralWallet = processData.wallet.data.publicAddress;
                var receiverAddress = processData.data.data.data.tronAddress;
                var uid = processData.data.data.uid;
                var receivedAmount = processData.data.data.receivedAmount;
                var senderAmount = processData.data.data.senderAmount;
                var language = processData.data.data.data.language;
                var timestamp = processData.data.key;
                tronWithdrawProcessArray.push({ key: key, centralWallet: centralWallet, receiverAddress: receiverAddress, uid: uid, receivedAmount: receivedAmount, senderAmount: senderAmount, language: language, timestamp: timestamp });
            })
            databaseRef.child('system').child('tronWithdrawBuffer').once('value', tronWithdrawBuffersSnapshot => {
                var tronWithdrawBuffers = [];
                tronWithdrawBuffersSnapshot.forEach(tronWithdrawBufferSnapshot => {
                    var transactionHash = tronWithdrawBufferSnapshot.key;
                    tronWeb.trx.getConfirmedTransaction(transactionHash).then((result) => {
                        if (result) {
                            if (result.ret[0]) {
                                if (result.ret[0].contractRet) {
                                    var resultData = result.ret[0].contractRet;
                                    if (resultData == 'SUCCESS') {
                                        tronWeb.getEventByTransactionID(transactionHash).then(resultEvent => {
                                            if (resultEvent) {
                                                if (resultEvent[0]) {
                                                    if (resultEvent[0]['name']) {
                                                        if (resultEvent[0]['name'] == 'Transfer') {
                                                            if (resultEvent[0]['result']) {
                                                                var initData = resultEvent[0]['result'];
                                                                var from = tronWeb.address.fromHex(initData.from);
                                                                var to = tronWeb.address.fromHex(initData.to);
                                                                var value = initData.value;
                                                                var exist = false;
                                                                for (var i = 0; i < tronWithdrawProcessArray.length; i++) {
                                                                    var processDT = tronWithdrawProcessArray[i];
                                                                    if ((from == processDT.centralWallet) && (to == processDT.receiverAddress) && (value == processDT.receivedAmount)) {
                                                                        exist = true;
                                                                        console.log(transactionHash, from, to, value, processDT.key, processDT.centralWallet, processDT.receiverAddress, processDT.uid, processDT.receivedAmount, processDT.senderAmount, processDT.language, processDT.timestamp);
                                                                        databaseRef.child('system').child('tronWithdrawFinish').child(transactionHash).set({
                                                                            transactionHash: transactionHash,
                                                                            centralWalletAddress: from,
                                                                            receiverWalletAddress: to,
                                                                            value: value,
                                                                            processKey: processDT.key,
                                                                            uid: processDT.uid,
                                                                            receivedAmount: processDT.receivedAmount,
                                                                            senderAmount: processDT.senderAmount,
                                                                            language: processDT.language,
                                                                            timestamp: processDT.timestamp
                                                                        });
                                                                        databaseRef.child('accounts').child(processDT.uid).child('readable').child('statusWithdrawTron').set('STATUS_3');
                                                                    }
                                                                }
                                                                if (exist == false) {
                                                                    databaseRef.child('system').child('tronWithdrawBuffer').child(transactionHash).remove();
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                    } else {
                                        if (resultData == 'REVERT') {
                                            if (result.raw_data) {
                                                if (result.raw_data.contract) {
                                                    if (result.raw_data.contract[0]) {
                                                        if (result.raw_data.contract[0].parameter) {
                                                            if (result.raw_data.contract[0].parameter.value) {
                                                                if (result.raw_data.contract[0].parameter.value.owner_address) {
                                                                    var from = tronWeb.address.fromHex(result.raw_data.contract[0].parameter.value.owner_address);
                                                                    console.log(from);
                                                                    var exist = false;
                                                                    for (var i = 0; i < tronWithdrawProcessArray.length; i++) {
                                                                        var processDT = tronWithdrawProcessArray[i];
                                                                        if (from == processDT.centralWallet) {
                                                                            exist = true;
                                                                            console.log(transactionHash, from, processDT.key, processDT.centralWallet, processDT.receiverAddress, processDT.uid, processDT.receivedAmount, processDT.senderAmount, processDT.language, processDT.timestamp);
                                                                            var amount = '' + (0 - (parseInt(processDT.senderAmount)));
                                                                            databaseRef.child('system').child('tronWithdrawRequests').child(processDT.timestamp).set({ uid: processDT.uid, receivedAmount: processDT.receivedAmount, senderAmount: processDT.senderAmount, data: { tronAddress: processDT.receiverAddress, language: processDT.language, amount: amount } });
                                                                            databaseRef.child('system').child('tronWithdrawProcess').child(processDT.key).remove();
                                                                        }
                                                                    }
                                                                    if (exist == false) {
                                                                        databaseRef.child('system').child('tronWithdrawBuffer').child(transactionHash).remove();
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }).catch((error) => {
                        console.log(error);
                    })
                });
            })
        })
    })

// firebase deploy --only functions:onSystemTronWithdrawFinish
exports.onSystemTronWithdrawFinish = functions.database.ref('/system/tronWithdrawFinish/{hashKey}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var hashKey = context.params.hashKey;
        console.log(hashKey, data.transactionHash, data.centralWalletAddress, data.receiverWalletAddress, data.value, data.processKey, data.uid, data.receivedAmount, data.senderAmount, data.language, data.timestamp);
        databaseRef.child('system').child('tronWithdrawBuffer').child(data.transactionHash).remove().then(() => {
            databaseRef.child('system').child('tronWithdrawProcess').child(data.processKey).remove().then(() => {
                databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').child(data.processKey).child('status').set('available').then(() => {
                    databaseRef.child('walletActions').child(data.uid).child(data.timestamp).set(data.senderAmount).then(() => {
                        databaseRef.child('accounts').child(data.uid).child('readable').child('walletActions').child(data.timestamp).set(data.senderAmount).then(() => {
                            databaseRef.child('accounts').child(data.uid).child('readable').child('busy').set(false).then(() => {
                                databaseRef.child('accounts').child(data.uid).child('readable').child('statusWithdrawTron').remove().then(() => {
                                    databaseRef.child('historic').child('transactions').child(data.uid).child(data.timestamp).set({ timestamp: data.timestamp, type: 'withdrawTRC20', tronAddress: data.receiverWalletAddress, amount: data.senderAmount, receivedAmount: data.receivedAmount }).then(() => {
                                        databaseRef.child('archive').child('transactions').child(data.timestamp).set({ timestamp: data.timestamp, type: 'withdrawTRC20', sender: data.uid, tronAddress: data.receiverWalletAddress, amount: data.senderAmount, receivedAmount: data.receivedAmount }).then(() => {
                                            databaseRef.child('messages').child(data.language).child('onRequestWithdrawTronUSDT').once('value', messageSnapshot => {
                                                var messageObject = messageSnapshot.val();
                                                databaseRef.child('accounts').child(data.uid).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: data.timestamp, success: true }).then(() => {
                                                    databaseRef.child('/system/tronWithdrawFinish/' + context.params.hashKey).remove();
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

// firebase deploy --only functions:deleteAuxs
exports.deleteAuxs = functions.pubsub.schedule('every 10 minutes')
    .onRun((context) => {
        var d = new Date();
        var n = d.getTime();
        var timeTrigger = n - 3600000;
        databaseRef.child('system').child('auxArchiveTronTransactions').once('value', auxArchiveTronTransactionsSnapshot => {
            auxArchiveTronTransactionsSnapshot.forEach(auxArchiveTronTransactionSnapshot => {
                var transactionKey = auxArchiveTronTransactionSnapshot.key;
                var transactionData = auxArchiveTronTransactionSnapshot.val();
                console.log(transactionKey, transactionData, timeTrigger, timeTrigger > transactionData)
                if (timeTrigger > transactionData) {
                    databaseRef.child('system').child('auxArchiveTronTransactions').child(transactionKey).remove();
                }
            })
        });
        return null;
    })

// firebase deploy --only functions:checkupUsdtWithdrawTrcCentralWallets
exports.checkupUsdtWithdrawTrcCentralWallets = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').once('value', usdtWithdrawTrcCentralWalletsSnapshot => {
            usdtWithdrawTrcCentralWalletsSnapshot.forEach(usdtWithdrawTrcCentralWalletSnapshot => {
                var data = usdtWithdrawTrcCentralWalletSnapshot.val();
                async function getContractBalance(contractAddressParam, walletAddressParam, walletIdParam) {
                    try {
                        let contract = await tronWeb.contract().at(contractAddressParam);
                        let usdtBalance = await contract.balanceOf(walletAddressParam).call();
                        let trxBalance = await tronWeb.trx.getBalance(walletAddressParam);
                        console.log(usdtWithdrawTrcCentralWalletSnapshot.key, data.publicAddress, Number(usdtBalance).toString(), Number(trxBalance).toString());
                        databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').child(walletIdParam).child('trx').set(Number(trxBalance).toString());
                        databaseRef.child('privateSettings').child('usdtWithdrawTrcCentralWallets').child(walletIdParam).child('usdt').set(Number(usdtBalance).toString());
                    } catch (error) {
                        console.error("trigger smart contract error", error)
                    }
                }
                getContractBalance(contractUSDT, data.publicAddress, usdtWithdrawTrcCentralWalletSnapshot.key);
            })
        });
        databaseRef.child('privateSettings').child('trxWithdrawTrcCentralWallets').once('value', trxWithdrawTrcCentralWalletsSnapshot => {
            trxWithdrawTrcCentralWalletsSnapshot.forEach(trxWithdrawTrcCentralWalletSnapshot => {
                var data = trxWithdrawTrcCentralWalletSnapshot.val();
                async function getBalance(walletAddressParam, walletIdParam) {
                    try {
                        let trxBalance = await tronWeb.trx.getBalance(walletAddressParam);
                        console.log(trxWithdrawTrcCentralWalletSnapshot.key, data.publicAddress, Number(trxBalance).toString());
                        databaseRef.child('privateSettings').child('trxWithdrawTrcCentralWallets').child(walletIdParam).child('trx').set(Number(trxBalance).toString());
                    } catch (error) {
                        console.error("trigger smart contract error", error)
                    }
                }
                getBalance(data.publicAddress, trxWithdrawTrcCentralWalletSnapshot.key);
            })
        });
        return null;
    })

// firebase deploy --only functions:checkupTronDepositSignals
exports.checkupTronDepositSignals = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        var d = new Date();
        var n = d.getTime();
        tronWeb.contract().at(contractUSDT).then(contract => {
            databaseRef.child('publicSettings').child('depositLimit').child('tron').once('value', depositLimitTronSnapshot => {
                var depositLimitTron = depositLimitTronSnapshot.val();
                var depositLimitTronUSDT = depositLimitTron.usdt;
                var depositLimitTronTRX = depositLimitTron.trx;
                var trxToAdd = depositLimitTron.trxToAdd;
                var fromServer = depositLimitTron.fromServer;
                var fromRefresh = depositLimitTron.fromRefresh;
                databaseRef.child('system').child('tronDepositSignals').once('value', tronDepositSignalsSnapshot => {
                    tronDepositSignalsSnapshot.forEach(tronDepositSignalSnapshot => {
                        var data = tronDepositSignalSnapshot.val();
                        var key = tronDepositSignalSnapshot.key;
                        console.log(key, data.date, data.tronWallet);
                        if (data.fromServer == true) {
                            if (n - data.date > fromServer) {
                                databaseRef.child('system').child('tronDepositSignals').child(key).remove();
                            }
                        } else {
                            if (n - data.date > fromRefresh) {
                                databaseRef.child('system').child('tronDepositSignals').child(key).remove();
                            }
                        }
                        async function getContractBalance(walletAddressParam, userIdParam) {
                            try {
                                let usdtBalance = await contract.balanceOf(walletAddressParam).call();
                                let trxBalance = await tronWeb.trx.getBalance(walletAddressParam);
                                var usdtBalanceInteger = Number(usdtBalance);
                                var trxBalanceInteger = Number(trxBalance);
                                var usdtBalanceString = usdtBalanceInteger.toString();
                                var trxBalanceString = trxBalanceInteger.toString();
                                console.log(userIdParam, walletAddressParam, Number(usdtBalance).toString(), Number(trxBalance).toString());
                                if (usdtBalanceInteger > 0) {
                                    if (depositLimitTronUSDT <= usdtBalanceInteger) {
                                        if (depositLimitTronTRX <= trxBalanceInteger) {
                                            databaseRef.child('system').child('tronDepositRequests').child(userIdParam).once('value', tronDepositRequestsSnapshot => {
                                                if (!tronDepositRequestsSnapshot.val()) {
                                                    databaseRef.child('system').child('tronDepositRequests').child(userIdParam).set({ wallet: walletAddressParam, usdt: usdtBalanceString, trx: trxBalanceString }).then(() => {
                                                        databaseRef.child('system').child('tronDepositSignals').child(key).remove();
                                                    })
                                                }
                                            })
                                        } else {
                                            databaseRef.child('system').child('trxDepositRequests').child(userIdParam).once('value', trxDepositProcessSnapshot => {
                                                if (!trxDepositProcessSnapshot.val()) {
                                                    databaseRef.child('system').child('trxDepositRequests').child(userIdParam).set({ wallet: walletAddressParam, usdt: usdtBalanceString, trx: trxBalanceString, trxToAdd: trxToAdd }).then(() => {})
                                                }
                                            })
                                        }
                                    } else {}
                                }
                            } catch (error) {
                                console.error("trigger smart contract error", error)
                            }
                        }
                        getContractBalance(data.tronWallet, key);
                    })
                });
            });
        })
        return null;
    })

// firebase deploy --only functions:checkupSystemTrxDepositRequests
exports.checkupSystemTrxDepositRequests = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('trxDepositRequests').once('value', trxDepositSRequestsSnapshot => {
            var trxDepositRequests = [];
            trxDepositSRequestsSnapshot.forEach(trxDepositRequestSnapshot => {
                if (trxDepositRequestSnapshot.val().flagged != true) {
                    trxDepositRequests.push({ key: trxDepositRequestSnapshot.key, data: trxDepositRequestSnapshot.val() });
                }
            });
            console.log(trxDepositRequests.length);
            databaseRef.child('privateSettings').child('trxWithdrawTrcCentralWallets').once('value', trxWithdrawTrcCentralWalletsSnapshot => {
                var centralWallets = [];
                trxWithdrawTrcCentralWalletsSnapshot.forEach(trxWithdrawTrcCentralWalletSnapshot => {
                    if (trxWithdrawTrcCentralWalletSnapshot.val().status == 'available') {
                        centralWallets.push({ key: trxWithdrawTrcCentralWalletSnapshot.key, data: trxWithdrawTrcCentralWalletSnapshot.val() });
                    }
                });
                console.log(centralWallets.length);
                if (centralWallets.length <= trxDepositRequests.length) {
                    for (i = 0; i < centralWallets.length; i++) {
                        console.log('1: ' + centralWallets[i].key, trxDepositRequests[i].key);
                        databaseRef.child('system').child('trxDepositsProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: trxDepositRequests[i] });
                        databaseRef.child('system').child('trxDepositRequests').child(trxDepositRequests[i].key).child('flagged').set(true);
                        databaseRef.child('privateSettings').child('trxWithdrawTrcCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                    }
                } else {
                    for (i = 0; i < trxDepositRequests.length; i++) {
                        console.log('2: ' + centralWallets[i].key, trxDepositRequests[i].key);
                        databaseRef.child('system').child('trxDepositsProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: trxDepositRequests[i] });
                        databaseRef.child('system').child('trxDepositRequests').child(trxDepositRequests[i].key).child('flagged').set(true);
                        databaseRef.child('privateSettings').child('trxWithdrawTrcCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                    }
                }
            })
        })
    })

// firebase deploy --only functions:onSystemTrxDepositsProcess
exports.onSystemTrxDepositsProcess = functions.database.ref('/system/trxDepositsProcess/{key}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var d = new Date();
        var n = d.getTime();
        console.log(context.params.key, data.data.data.wallet, data.wallet.data.privateKey, data.wallet.data.publicAddress, data.data.data.trxToAdd);
        databaseRef.child('costs').child('trx').child(n).set({ wallet: data.data.data.wallet, amount: data.data.data.trxToAdd });
        var to = data.data.data.wallet;
        var from = data.wallet.data.publicAddress;
        var privateKey = data.wallet.data.privateKey;
        var amount = parseInt(data.data.data.trxToAdd);
        var tronWebAux = new TronWeb({
            fullHost: 'https://api.trongrid.io',
            headers: { "TRON-PRO-API-KEY": '88e0b02f-034c-4ddc-8dbc-bc7afffadee1' },
        })
        async function sentTrxFunction() {
            var tradeobj = await tronWebAux.transactionBuilder.sendTrx(to, amount, from);
            var signedtxn = await tronWebAux.trx.sign(tradeobj, privateKey);
            await tronWebAux.trx.sendRawTransaction(signedtxn);
        }
        return sentTrxFunction();
    })

// firebase deploy --only functions:checkupSystemTrxDepositsProcess
exports.checkupSystemTrxDepositsProcess = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('publicSettings').child('depositLimit').child('tron').child('trx').once('value', trxSnapshot => {
            var trx = trxSnapshot.val();
            databaseRef.child('system').child('trxDepositsProcess').once('value', trxDepositsProcessSnapshot => {
                trxDepositsProcessSnapshot.forEach(trxDepositProcessSnapshot => {
                    var data = trxDepositProcessSnapshot.val();
                    var key = trxDepositProcessSnapshot.key;
                    console.log(key, data.data.data.wallet, data.data.key);
                    async function getBalance(walletAddressParam, walletIdParam, userUIDParam) {
                        try {
                            let trxBalance = await tronWeb.trx.getBalance(walletAddressParam);
                            console.log(walletIdParam, walletAddressParam, Number(trxBalance), trx < Number(trxBalance), userUIDParam);
                            if (trx <= Number(trxBalance)) {
                                databaseRef.child('system').child('trxDepositRequests').child(userUIDParam).remove();
                                databaseRef.child('system').child('trxDepositsProcess').child(walletIdParam).remove();
                                databaseRef.child('privateSettings').child('trxWithdrawTrcCentralWallets').child(walletIdParam).child('status').set('available');
                            }
                        } catch (error) {
                            console.error("trigger smart contract error", error)
                        }
                    }
                    getBalance(data.data.data.wallet, key, data.data.key);
                });
            })
        });
    })

// firebase deploy --only functions:onSystemTronDepositRequests
exports.onSystemTronDepositRequests = functions.database.ref('/system/tronDepositRequests/{key}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var key = context.params.key;
        console.log('1: ', key, data.usdt, data.wallet);
        var d = new Date();
        var n = d.getTime();
        return databaseRef.child('messages').child('EN').child('onDepositTronUSDT').once('value', messageSnapshot => {
            if (messageSnapshot.val()) {
                console.log('mawjoud');
                var messageObject = messageSnapshot.val();
                if (messageObject.newAmount) {
                    console.log('mawjoud kamen');
                    var messageNewAmount = messageObject.newAmount;
                    var amount = parseInt(data.usdt) / 1000000
                    messageNewAmount.message += amount;
                    databaseRef.child('accounts').child(key).child('readable').child('tenSecondNotification').set({ message: messageObject.newAmount.message, timestamp: n, success: true }).then(() => {
                        return databaseRef.child('privateSettings').child('tronCentralBanks').once('value', tronCentralBanksSnapshot => {
                            var centralBankWallet = tronCentralBanksSnapshot.val().publicAddress;
                            console.log('2', key, data.usdt, data.wallet, centralBankWallet);
                            databaseRef.child('accounts').child(key).child('unreadable').child('trcPrivateKey').once('value', privateKeySnapshot => {
                                var privateKey = privateKeySnapshot.val();
                                async function triggercontract() {
                                    console.log('3', key, data.usdt, data.wallet, centralBankWallet, privateKey);
                                    var tronWebAux = new TronWeb({
                                        fullHost: 'https://api.trongrid.io',
                                        headers: { "TRON-PRO-API-KEY": '88e0b02f-034c-4ddc-8dbc-bc7afffadee1' },
                                        privateKey: privateKey
                                    })
                                    let withdrawInstance = await tronWebAux.contract().at(contractUSDT);
                                    withdrawInstance.transfer(centralBankWallet, parseInt(data.usdt)).send({
                                        feeLimit: 100000000,
                                        callValue: 0,
                                        shouldPollResponse: true
                                    }).then((result) => {
                                        console.log('result:');
                                        console.log(result);
                                    }).catch((error) => {
                                        console.log('error: ');
                                        console.log(error);
                                        if (error.error) {
                                            if (error.error == 'BANDWITH_ERROR') {
                                                databaseRef.child("system/rejectedBandwithTronDeposit/").push(data, (err) => {
                                                    console.log(err);
                                                    console.log("Done");
                                                });
                                            }
                                        }
                                        if (error.transaction) {
                                            if (error.transaction.txID) {
                                                databaseRef.child("system/tronDepositTransactionsToCentral/").push(error.transaction.txID, (err) => {
                                                    console.log(err);
                                                    console.log("Done");
                                                });
                                            }
                                        }
                                    });
                                }
                                triggercontract();
                            });
                        });
                    })
                }
            }
        })
    })

// firebase deploy --only functions:onSystemTronDepositTransactions
exports.onSystemTronDepositTransactions = functions.database.ref('/system/tronDepositTransactionsToCentral/{key}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var d = new Date();
        var n = d.getTime();
        console.log(data)
        return databaseRef.child('system').child('tronDepositBuffer').child(data).once('value', transactionBufferSnapshot => {
            if (!transactionBufferSnapshot.val()) {
                databaseRef.child('system').child('auxArchiveTronTransactions').child(data).once('value', auxArchiveTronTransactionSnapshot => {
                    if (!auxArchiveTronTransactionSnapshot.val()) {
                        databaseRef.child('system').child('tronDepositBuffer').child(data).set(data).then(() => {
                            databaseRef.child('system').child('auxArchiveTronTransactions').child(data).set(n).then(() => {
                                databaseRef.child('system').child('tronDepositTransactionsToCentral').child(context.params.key).remove();
                            })
                        })
                    } else {
                        databaseRef.child('system').child('tronDepositTransactionsToCentral').child(context.params.key).remove();
                    }
                })
            } else {
                databaseRef.child('system').child('tronDepositTransactionsToCentral').child(context.params.key).remove();
            }
        })
    })

// firebase deploy --only functions:checkupSystemTronDepositBuffer
exports.checkupSystemTronDepositBuffer = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('tronDepositRequests').once('value', tronDepositRequestsSnapshot => {
            var tronDepositRequestsArray = [];
            tronDepositRequestsSnapshot.forEach(tronDepositRequestSnapshot => {
                var uid = tronDepositRequestSnapshot.key;
                var tronDepositRequestData = tronDepositRequestSnapshot.val();
                var usdt = tronDepositRequestData.usdt;
                var wallet = tronDepositRequestData.wallet;
                tronDepositRequestsArray.push({ uid: uid, usdt: usdt, wallet: wallet });
            })
            for (var i = 0; i < tronDepositRequestsArray.length; i++) {
                console.log(tronDepositRequestsArray[i].uid, tronDepositRequestsArray[i].usdt, tronDepositRequestsArray[i].wallet);
            }
            databaseRef.child('system').child('tronDepositBuffer').once('value', tronDepositBuffersSnapshot => {
                var tronDepositBuffers = [];
                tronDepositBuffersSnapshot.forEach(tronDepositBufferSnapshot => {
                    var transactionHash = tronDepositBufferSnapshot.key;
                    tronWeb.trx.getConfirmedTransaction(transactionHash).then((result) => {
                        var d = new Date();
                        var n = d.getTime();
                        if (result) {
                            if (result.ret[0]) {
                                if (result.ret[0].contractRet) {
                                    var resultData = result.ret[0].contractRet;
                                    console.log(resultData);
                                    if (resultData == 'SUCCESS') {
                                        tronWeb.getEventByTransactionID(transactionHash).then(resultEvent => {
                                            if (resultEvent) {
                                                if (resultEvent[0]) {
                                                    if (resultEvent[0]['name']) {
                                                        if (resultEvent[0]['name'] == 'Transfer') {
                                                            if (resultEvent[0]['result']) {
                                                                var initData = resultEvent[0]['result'];
                                                                var from = tronWeb.address.fromHex(initData.from);
                                                                var to = tronWeb.address.fromHex(initData.to);
                                                                var value = initData.value;
                                                                var exist = false;
                                                                console.log(from, to, value);
                                                                for (var i = 0; i < tronDepositRequestsArray.length; i++) {
                                                                    var processDT = tronDepositRequestsArray[i];
                                                                    if ((from == processDT.wallet) && (value == processDT.usdt)) {
                                                                        exist = true;
                                                                        databaseRef.child('system').child('tronDepositFinish').child(transactionHash).set({
                                                                            transactionHash: transactionHash,
                                                                            wallet: from,
                                                                            value: value,
                                                                            uid: processDT.uid,
                                                                            timestamp: n
                                                                        });
                                                                    }
                                                                }
                                                                if (exist == false) {
                                                                    databaseRef.child('system').child('tronDepositBuffer').child(transactionHash).remove();
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                    } else {
                                        databaseRef.child('archive').child('issues').child('depositTRC').child(transactionHash).set({ transaction: transactionHash, issue: 'transaction not SUCCESS' });
                                    }
                                } else {
                                    databaseRef.child('archive').child('issues').child('depositTRC').child(transactionHash).set({ transaction: transactionHash, issue: 'transaction has no Contract Ret' });
                                }
                            } else {
                                databaseRef.child('archive').child('issues').child('depositTRC').child(transactionHash).set({ transaction: transactionHash, issue: 'transaction has no Ret' });
                            }
                        } else {
                            databaseRef.child('archive').child('issues').child('depositTRC').child(transactionHash).set({ transaction: transactionHash, issue: 'transaction has no Result' });
                        }
                    }).catch((error) => {
                        console.log(error);
                    })
                });
            })
        })
    })

// firebase deploy --only functions:onSystemTronDepositFinish
exports.onSystemTronDepositFinish = functions.database.ref('/system/tronDepositFinish/{hashKey}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var hashKey = context.params.hashKey;
        console.log(hashKey, data.wallet, data.uid, data.value, data.timestamp);
        databaseRef.child('system').child('tronDepositBuffer').child(hashKey).remove().then(() => {
            databaseRef.child('system').child('tronDepositRequests').child(data.uid).remove().then(() => {
                databaseRef.child('walletActions').child(data.uid).child(data.timestamp).set(data.value).then(() => {
                    databaseRef.child('accounts').child(data.uid).child('readable').child('walletActions').child(data.timestamp).set(data.value).then(() => {
                        databaseRef.child('historic').child('transactions').child(data.uid).child(data.timestamp).set({ timestamp: data.timestamp, type: 'depositTRC20', tronAddress: data.wallet, amount: data.value }).then(() => {
                            databaseRef.child('archive').child('transactions').child(data.timestamp).set({ timestamp: data.timestamp, type: 'depositTRC20', sender: data.uid, tronAddress: data.wallet, amount: data.value }).then(() => {
                                databaseRef.child('messages').child('EN').child('onDepositTronUSDT').once('value', messageSnapshot => {
                                    var messageObject = messageSnapshot.val();
                                    databaseRef.child('accounts').child(data.uid).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: data.timestamp, success: true }).then(() => {
                                        databaseRef.child('/system/tronDepositFinish/' + context.params.hashKey).remove();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

// firebase deploy --only functions:onRequestRefresh
exports.onRequestRefresh = functions.database.ref('/requests/refresh/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var mainLanguage = snapshot.val();
        return databaseRef.child('messages').child(mainLanguage).child('onRequestRefresh').once('value', messageSnapshot => {
            var messageObject = messageSnapshot.val();
            console.log(messageObject.success.message);
            if (messageObject.success.message) {
                databaseRef.child('trcUserAccounts').child(context.params.accnountID).once('value', tronWalletSnapshot => {
                    var tronWallet = tronWalletSnapshot.val();
                    if (tronWallet) {
                        databaseRef.child('system').child('tronDepositSignals').child(context.params.accnountID).set({ date: n, tronWallet: tronWallet }).then(() => {
                            databaseRef.child('requests').child('refresh').child(context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                            })
                        })
                    }
                })
            }
        })
    })

// firebase deploy --only functions:onRequestSwapUSDT
exports.onRequestSwapUSDT = functions.database.ref('/requests/swapUSDT/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestSwapUSDT').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                databaseRef.child('messages').child(mainLanguage).child('onRequestSwapUSDT').once('value', messageSnapshot => {
                    var messageObject = messageSnapshot.val();
                    databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                        if (usdtifyBlockSnapshot.val() != true) {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                if (!walletActionsSnapshot.val()) {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                        if (busySnapshot.val() != true) {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('swapUSDT').once('value', swapUSDTReadableSnapshot => {
                                                if (!swapUSDTReadableSnapshot.val()) {
                                                    if (semiOriginal['amount'] && semiOriginal['type']) {
                                                        var amountString = semiOriginal['amount'];
                                                        var type = semiOriginal['type'];
                                                        if (isNumeric(amountString)) {
                                                            var amount = parseInt(amountString);
                                                            if (amount > 0) {
                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                                                    if (balanceSnapshot.val()) {
                                                                        var balance = parseInt(balanceSnapshot.val());
                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                                                            if (!walletActionsSnapshot.val()) {
                                                                                if (balance >= amount) {
                                                                                    databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', statusSnapshot => {
                                                                                        if (!statusSnapshot.val() == true) {
                                                                                            databaseRef.child('publicSettings').child('transactionFees').child('swapUSDTFees').once('value', swapUSDTFeesSnapshot => {
                                                                                                var swapUSDTFees = swapUSDTFeesSnapshot.val();
                                                                                                databaseRef.child('publicSettings').child('transactionFees').child('swapMinimumFees').once('value', swapMinimumFeesSnapshot => {
                                                                                                    var swapMinimumFees = swapMinimumFeesSnapshot.val();
                                                                                                    var swapFees = parseInt((amount * swapUSDTFees) / 100);
                                                                                                    if (swapFees < swapMinimumFees) {
                                                                                                        swapFees = swapMinimumFees;
                                                                                                    }
                                                                                                    var receivedAmount = parseInt((amount - swapFees) / 1000000);
                                                                                                    console.log('amount: ' + amount + ', swapUSDTFees: ' + swapUSDTFees + ', receivedAmount: ' + receivedAmount);
                                                                                                    databaseRef.child('publicSettings').child('swapMinimumAmount').once('value', swapMinimumAmountSnapshot => {
                                                                                                        var swapMinimumAmount = parseInt(swapMinimumAmountSnapshot.val());
                                                                                                        if (swapMinimumAmount <= amount) {
                                                                                                            databaseRef.child('publicSettings').child('swapTypes').once('value', swapTypesSnapshot => {
                                                                                                                var swapTypeObject = {};
                                                                                                                swapTypesSnapshot.forEach(swapTypeSnapshot => {
                                                                                                                    if (swapTypeSnapshot.val().symbol == type) {
                                                                                                                        swapTypeObject = swapTypeSnapshot.val();
                                                                                                                    }
                                                                                                                })
                                                                                                                databaseRef.child('publicSettings').child('swapTerms').child(mainLanguage).once('value', swapTermsSnapshot => {
                                                                                                                    var swapTermsObject = swapTermsSnapshot.val();
                                                                                                                    var swapObject = {};
                                                                                                                    swapObject.type = swapTypeObject;
                                                                                                                    swapObject.amount = amount;
                                                                                                                    swapObject.fees = swapUSDTFees;
                                                                                                                    swapObject.swapMinimumFees = swapMinimumFees;
                                                                                                                    swapObject.receivedAmount = receivedAmount;
                                                                                                                    swapObject.terms = swapTermsObject;
                                                                                                                    swapObject.status = 'Pending';
                                                                                                                    swapObject.message = 'Pending For Review';
                                                                                                                    swapObject.timestamp = n;
                                                                                                                    swapObject.pending = true;
                                                                                                                    swapObject.rejected = false;
                                                                                                                    swapObject.sent = false;
                                                                                                                    swapObject.processing = false;
                                                                                                                    var realAmountString = '-' + amount;
                                                                                                                    databaseRef.child('walletActions').child(context.params.accnountID).child(n).set(realAmountString).then(() => {
                                                                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(n).set(realAmountString).then(() => {
                                                                                                                            databaseRef.child('admin').child('swapUSDTRequest').child(context.params.accnountID).set(swapObject).then(() => {
                                                                                                                                databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.requestSent.message, timestamp: n, success: true });
                                                                                                                                });
                                                                                                                            })
                                                                                                                        });
                                                                                                                    });
                                                                                                                })
                                                                                                            })
                                                                                                        } else {
                                                                                                            databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.amountUnderMinimum.message, timestamp: n, success: false });
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                })
                                                                                            })
                                                                                        } else {
                                                                                            databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.systemBlocked.message, timestamp: n, success: false });
                                                                                            });
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                                    });
                                                                                }
                                                                            } else {
                                                                                databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.anotherTransactionInProcess.message, timestamp: n, success: false });
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                        });
                                                                    }
                                                                })
                                                            } else {
                                                                databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                });
                                                            }
                                                        } else {
                                                            databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                            });
                                                        }
                                                    } else {
                                                        databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormat.message, timestamp: n, success: false });
                                                        });
                                                    }
                                                } else {
                                                    databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.anotherTransactionInProcess.message, timestamp: n, success: false });
                                                    });
                                                }
                                            })
                                        } else {
                                            databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                            });
                                        }
                                    })
                                } else {
                                    databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                    });
                                }
                            })
                        } else {
                            databaseRef.child('/requests/swapUSDT/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                            });
                        }
                    })
                })
            })
        })
    })

// firebase deploy --only functions:onUpdateSwapUSDTRequest
exports.onUpdateSwapUSDTRequest = functions.database.ref('/admin/swapUSDTRequest/{accnountID}')
    .onWrite((change, context) => {
        if (change.after.exists()) {
            var original = change.after.val();
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('swapUSDT').set(original);
        } else {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('swapUSDT').remove();
        }
    })

// firebase deploy --only functions:onAdminRequestUpdateSwapProfile
exports.onAdminRequestUpdateSwapProfile = functions.database.ref('/adminRequests/updateSwapProfile/{adminID}')
    .onCreate((snapshot, context) => {
        var dataSnapshot = snapshot.val();
        console.log(dataSnapshot.uid);
        var data = dataSnapshot.data;
        databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).child('message').set(data.message);
        if (data.link) {
            databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).child('link').set(data.link);
        } else {
            databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).child('link').remove();
        }
        if (data.linkTitle) {
            databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).child('linkTitle').set(data.linkTitle);
        } else {
            databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).child('linkTitle').remove();
        }
        databaseRef.child('adminRequests').child('updateSwapProfile').child(context.params.adminID).remove();
        return 0;
    })

// firebase deploy --only functions:onAdminRequestMakeSwapPending
exports.onAdminRequestMakeSwapPending = functions.database.ref('/adminRequests/makeSwapPending/{adminID}')
    .onCreate((snapshot, context) => {
        var dataSnapshot = snapshot.val();
        console.log(dataSnapshot.uid);
        var updateObject = {
            status: 'Pending',
            pending: true,
            processing: false,
            rejected: false,
            sent: false
        }
        databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).update(updateObject).then(() => {
            databaseRef.child('adminRequests').child('makeSwapPending').child(context.params.adminID).remove();
        })
        return 0;
    })

// firebase deploy --only functions:onAdminRequestMakeSwapProcessing
exports.onAdminRequestMakeSwapProcessing = functions.database.ref('/adminRequests/makeSwapProcessing/{adminID}')
    .onCreate((snapshot, context) => {
        var dataSnapshot = snapshot.val();
        console.log(dataSnapshot.uid);
        var updateObject = {
            status: 'Processing',
            pending: false,
            processing: true,
            rejected: false,
            sent: false
        }
        databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).update(updateObject).then(() => {
            databaseRef.child('adminRequests').child('makeSwapProcessing').child(context.params.adminID).remove();
        })
        return 0;
    })

// firebase deploy --only functions:onAdminRequestMakeSwapRejected
exports.onAdminRequestMakeSwapRejected = functions.database.ref('/adminRequests/makeSwapRejected/{adminID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var dataSnapshot = snapshot.val();
        console.log(dataSnapshot.uid);
        var updateObject = {
            status: 'Rejected',
            pending: false,
            processing: false,
            rejected: true,
            sent: false
        }
        return databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).update(updateObject).then(() => {
            databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).once('value', swapUSDTRequestSnapshot => {
                if (swapUSDTRequestSnapshot.val()) {
                    var swapUSDTRequestData = swapUSDTRequestSnapshot.val();
                    var amount = '' + swapUSDTRequestData.amount;
                    var uid = dataSnapshot.uid;
                    console.log(amount, uid);
                    databaseRef.child('walletActions').child(uid).child(n).set(amount).then(() => {
                        databaseRef.child('accounts').child(uid).child('readable').child('walletActions').child(n).set(amount).then(() => {
                            databaseRef.child('archive').child('transactions').child(n).set({ timestamp: n, type: 'swapUSDT', data: swapUSDTRequestData, uid: uid }).then(() => {
                                databaseRef.child('adminRequests').child('makeSwapRejected').child(context.params.adminID).remove();
                            })
                        });
                    });
                } else {
                    databaseRef.child('adminRequests').child('makeSwapRejected').child(context.params.adminID).remove();
                }
            })
        })
    })

// firebase deploy --only functions:onAdminRequestMakeSwapSent
exports.onAdminRequestMakeSwapSent = functions.database.ref('/adminRequests/makeSwapSent/{adminID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var dataSnapshot = snapshot.val();
        console.log(dataSnapshot.uid);
        var updateObject = {
            status: 'Sent',
            pending: false,
            processing: false,
            rejected: false,
            sent: true
        }
        return databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).update(updateObject).then(() => {
            databaseRef.child('admin').child('swapUSDTRequest').child(dataSnapshot.uid).once('value', swapUSDTRequestSnapshot => {
                var swapUSDTRequestData = swapUSDTRequestSnapshot.val();
                databaseRef.child('historic').child('transactions').child(dataSnapshot.uid).child(n).set({ timestamp: n, type: 'swapUSDT', data: swapUSDTRequestData }).then(() => {
                    databaseRef.child('archive').child('transactions').child(n).set({ timestamp: n, type: 'swapUSDT', data: swapUSDTRequestData, uid: dataSnapshot.uid }).then(() => {
                        databaseRef.child('adminRequests').child('makeSwapSent').child(context.params.adminID).remove();
                    })
                })
            })
        })
    })

// firebase deploy --only functions:onRequestStartOver
exports.onRequestStartOver = functions.database.ref('/requests/startOver/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('admin').child('swapUSDTRequest').child(context.params.accnountID).once('value', swapUSDTRequestSnapshot => {
            if (swapUSDTRequestSnapshot.val()) {
                var swapData = swapUSDTRequestSnapshot.val();
                if ((swapData.sent == true) || (swapData.rejected == true)) {
                    databaseRef.child('admin').child('swapUSDTRequest').child(context.params.accnountID).remove().then(() => {
                        databaseRef.child('requests').child('startOver').child(context.params.accnountID).remove()
                    })
                } else {
                    databaseRef.child('requests').child('startOver').child(context.params.accnountID).remove();
                }
            } else {
                databaseRef.child('requests').child('startOver').child(context.params.accnountID).remove();
            }
        })
    })

// firebase deploy --only functions:onWalletAction
exports.onWalletAction = functions.database.ref('/walletActions/{accnountID}/{actionKey}')
    .onCreate((snapshot, context) => {
        var amountToAdd1 = snapshot.val();
        var amountToAdd2 = parseInt(amountToAdd1);
        var amountToAdd3 = amountToAdd2;
        if (amountToAdd2 < 0) {
            amountToAdd3 = -amountToAdd2;
        }
        var amountToAdd4 = parseInt(amountToAdd3 / 1000000);
        return databaseRef.child('system').child('addTotal').set(amountToAdd4);
    })

// firebase deploy --only functions:onAddTotal
exports.onAddTotal = functions.database.ref('/system/addTotal')
    .onCreate((snapshot, context) => {
        var newAmountParam = snapshot.val()
        return databaseRef.child('publicSettings').child('totals').once('value', totalsSnapshot => {
            var totalAmounts = 0;
            var totalTransactions = 0;
            var totals = totalsSnapshot.val();
            if (totals.totalAmounts) {
                totalAmounts = totals.totalAmounts;
            }
            if (totals.totalTransactions) {
                totalTransactions = totals.totalTransactions;
            }
            totalTransactions += 1;
            totalAmounts += parseInt(newAmountParam);
            databaseRef.child('publicSettings').child('totals').set({ totalAmounts: totalAmounts, totalTransactions: totalTransactions }).then(() => {
                databaseRef.child('system').child('addTotal').remove();
            })
        })
    })

// firebase deploy --only functions:onRequestWithdrawBinanceUSDT
exports.onRequestWithdrawBinanceUSDT = functions.database.ref('/requests/withdrawBinanceUSDT/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestWithdrawBinanceUSDT').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                databaseRef.child('messages').child(mainLanguage).child('onRequestWithdrawBinanceUSDT').once('value', messageSnapshot => {
                    var messageObject = messageSnapshot.val();
                    if (semiOriginal['amount'] && semiOriginal['binanceAddress']) {
                        var amountData = semiOriginal['amount'];
                        var binanceAddress = semiOriginal['binanceAddress'];
                        if (web3BSC.utils.isAddress(binanceAddress)) {
                            if (isNumeric(amountData)) {
                                console.log(amountData);
                                databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                                    if (usdtifyBlockSnapshot.val() != true) {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                            if (!walletActionsSnapshot.val()) {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                                    if (busySnapshot.val() != true) {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                                            if (balanceSnapshot.val()) {
                                                                var balance = parseInt(balanceSnapshot.val());
                                                                var amount = parseInt(amountData / 1000000000000);
                                                                if (amount > 0) {
                                                                    if (balance >= amount) {
                                                                        databaseRef.child('publicSettings').child('transactionFees').child('bepWithdraw').once('value', transactionFeesBepWithdrawSnapshot => {
                                                                            var transactionFeesBepWithdraw = 0;
                                                                            if (transactionFeesBepWithdrawSnapshot.val()) {
                                                                                transactionFeesBepWithdraw = parseInt(transactionFeesBepWithdrawSnapshot.val());
                                                                            }
                                                                            var senderAmount = '-' + amount;
                                                                            if ((amount - transactionFeesBepWithdraw) > 0) {
                                                                                var receivedAmount = '' + (amount - transactionFeesBepWithdraw);
                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').set(true).then(() => {
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('statusWithdrawBinance').set('STATUS_1').then(() => {
                                                                                        databaseRef.child('system').child('binanceWithdrawRequests').child(n).set({ data: semiOriginal, uid: context.params.accnountID, receivedAmount: receivedAmount, senderAmount: senderAmount }).then(() => {
                                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.startingTransfer.message, timestamp: n, success: true }).then(() => {
                                                                                                databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove();
                                                                                            })
                                                                                        })
                                                                                    });
                                                                                });
                                                                            } else {
                                                                                databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                        });
                                                                    }
                                                                } else {
                                                                    databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                    });
                                                                }
                                                            } else {
                                                                databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                });
                                                            }
                                                        })
                                                    } else {
                                                        databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                        });
                                                    }
                                                })
                                            } else {
                                                databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                });
                                            }
                                        })
                                    } else {
                                        databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').child(n).set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                        });
                                    }
                                })
                            } else {
                                databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                });
                            }
                        } else {
                            databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidBinanceAddress.message, timestamp: n, success: false });
                            });
                        }
                    } else {
                        databaseRef.child('/requests/withdrawBinanceUSDT/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                        });
                    }
                })
            })
        })
    })

// firebase deploy --only functions:onRequestWithdrawEthereumUSDT
exports.onRequestWithdrawEthereumUSDT = functions.database.ref('/requests/withdrawEthereumUSDT/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestWithdrawEthereumUSDT').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                databaseRef.child('messages').child(mainLanguage).child('onRequestWithdrawEthereumUSDT').once('value', messageSnapshot => {
                    var messageObject = messageSnapshot.val();
                    if (semiOriginal['amount'] && semiOriginal['ethereumAddress']) {
                        var amountData = semiOriginal['amount'];
                        var ethereumAddress = semiOriginal['ethereumAddress'];
                        if (web3ETH.utils.isAddress(ethereumAddress)) {
                            if (isNumeric(amountData)) {
                                console.log(amountData);
                                databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                                    if (usdtifyBlockSnapshot.val() != true) {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                            if (!walletActionsSnapshot.val()) {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                                    if (busySnapshot.val() != true) {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                                            if (balanceSnapshot.val()) {
                                                                var balance = parseInt(balanceSnapshot.val());
                                                                var amount = parseInt(amountData);
                                                                if (amount > 0) {
                                                                    if (balance >= amount) {
                                                                        databaseRef.child('publicSettings').child('transactionFees').child('ethWithdraw').once('value', transactionFeesEthWithdrawSnapshot => {
                                                                            var transactionFeesEthWithdraw = 0;
                                                                            if (transactionFeesEthWithdrawSnapshot.val()) {
                                                                                transactionFeesEthWithdraw = parseInt(transactionFeesEthWithdrawSnapshot.val());
                                                                            }
                                                                            var senderAmount = '-' + amount;
                                                                            if ((amount - transactionFeesEthWithdraw) > 0) {
                                                                                var receivedAmount = '' + (amount - transactionFeesEthWithdraw);
                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').set(true).then(() => {
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('statusWithdrawEthereum').set('STATUS_1').then(() => {
                                                                                        databaseRef.child('system').child('ethereumWithdrawRequests').child(n).set({ data: semiOriginal, uid: context.params.accnountID, receivedAmount: receivedAmount, senderAmount: senderAmount }).then(() => {
                                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.startingTransfer.message, timestamp: n, success: true }).then(() => {
                                                                                                databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove();
                                                                                            })
                                                                                        })
                                                                                    });
                                                                                });
                                                                            } else {
                                                                                databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                        });
                                                                    }
                                                                } else {
                                                                    databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                    });
                                                                }
                                                            } else {
                                                                databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                });
                                                            }
                                                        })
                                                    } else {
                                                        databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                        });
                                                    }
                                                })
                                            } else {
                                                databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                });
                                            }
                                        })
                                    } else {
                                        databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').child(n).set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                        });
                                    }
                                })
                            } else {
                                databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                });
                            }
                        } else {
                            databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidEthereumAddress.message, timestamp: n, success: false });
                            });
                        }
                    } else {
                        databaseRef.child('/requests/withdrawEthereumUSDT/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                        });
                    }
                })
            })
        })
    })

// firebase deploy --only functions:checkupSystemWithdrawBinanceRequests
exports.checkupSystemWithdrawBinanceRequests = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('binanceWithdrawRequests').once('value', binanceWithdrawRequestsSnapshot => {
            var binanceWithdrawRequests = [];
            binanceWithdrawRequestsSnapshot.forEach(binanceWithdrawRequestSnapshot => {
                binanceWithdrawRequests.push({ key: binanceWithdrawRequestSnapshot.key, data: binanceWithdrawRequestSnapshot.val() });
            });
            console.log(binanceWithdrawRequests.length);
            databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').once('value', usdtWithdrawBscCentralWalletsSnapshot => {
                var centralWallets = [];
                usdtWithdrawBscCentralWalletsSnapshot.forEach(usdtWithdrawBscCentralWalletSnapshot => {
                    if (usdtWithdrawBscCentralWalletSnapshot.val().status == 'available') {
                        centralWallets.push({ key: usdtWithdrawBscCentralWalletSnapshot.key, data: usdtWithdrawBscCentralWalletSnapshot.val() });
                    }
                })
                console.log(centralWallets.length);
                if (centralWallets.length <= binanceWithdrawRequests.length) {
                    console.log("centralWallets is less then or equal binanceWithdrawRequests");
                    for (i = 0; i < centralWallets.length; i++) {
                        console.log('1: ' + centralWallets[i].key, binanceWithdrawRequests[i].key);
                        if (parseInt(centralWallets[i].data.usdt) > parseInt(binanceWithdrawRequests[i].data.receivedAmount)) {
                            databaseRef.child('system').child('binanceWithdrawProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: binanceWithdrawRequests[i] });
                            databaseRef.child('system').child('binanceWithdrawRequests').child(binanceWithdrawRequests[i].key).remove();
                            databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                            databaseRef.child('accounts').child(binanceWithdrawRequests[i].data.uid).child('readable').child('statusWithdrawBinance').set('STATUS_2');
                        } else {
                            databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                        }
                    }
                } else {
                    console.log("centralWallets is less then binanceWithdrawRequests");
                    for (i = 0; i < binanceWithdrawRequests.length; i++) {
                        if (parseInt(centralWallets[i].data.usdt) > parseInt(binanceWithdrawRequests[i].data.receivedAmount)) {
                            databaseRef.child('system').child('binanceWithdrawProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: binanceWithdrawRequests[i] });
                            databaseRef.child('system').child('binanceWithdrawRequests').child(binanceWithdrawRequests[i].key).remove();
                            databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                            databaseRef.child('accounts').child(binanceWithdrawRequests[i].data.uid).child('readable').child('statusWithdrawBinance').set('STATUS_2');
                        } else {
                            databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                        }
                    }
                }
            })
        })
    })

// firebase deploy --only functions:checkupSystemWithdrawEthereumRequests
exports.checkupSystemWithdrawEthereumRequests = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('ethereumWithdrawRequests').once('value', ethereumWithdrawRequestsSnapshot => {
            var ethereumWithdrawRequests = [];
            ethereumWithdrawRequestsSnapshot.forEach(ethereumWithdrawRequestSnapshot => {
                ethereumWithdrawRequests.push({ key: ethereumWithdrawRequestSnapshot.key, data: ethereumWithdrawRequestSnapshot.val() });
            });
            console.log(ethereumWithdrawRequests.length);
            databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').once('value', usdtWithdrawEthCentralWalletsSnapshot => {
                var centralWallets = [];
                usdtWithdrawEthCentralWalletsSnapshot.forEach(usdtWithdrawEthCentralWalletSnapshot => {
                    if (usdtWithdrawEthCentralWalletSnapshot.val().status == 'available') {
                        centralWallets.push({ key: usdtWithdrawEthCentralWalletSnapshot.key, data: usdtWithdrawEthCentralWalletSnapshot.val() });
                    }
                })
                console.log(centralWallets.length);
                if (centralWallets.length <= ethereumWithdrawRequests.length) {
                    console.log("centralWallets is less then or equal ethereumWithdrawRequests");
                    for (i = 0; i < centralWallets.length; i++) {
                        console.log('1: ' + centralWallets[i].key, ethereumWithdrawRequests[i].key);
                        if (parseInt(centralWallets[i].data.usdt) > parseInt(ethereumWithdrawRequests[i].data.receivedAmount)) {
                            databaseRef.child('system').child('ethereumWithdrawProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: ethereumWithdrawRequests[i] });
                            databaseRef.child('system').child('ethereumWithdrawRequests').child(ethereumWithdrawRequests[i].key).remove();
                            databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                            databaseRef.child('accounts').child(ethereumWithdrawRequests[i].data.uid).child('readable').child('statusWithdrawEthereum').set('STATUS_2');
                        } else {
                            databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                        }
                    }
                } else {
                    console.log("centralWallets is more then ethereumWithdrawRequests");
                    for (i = 0; i < ethereumWithdrawRequests.length; i++) {
                        if (parseInt(centralWallets[i].data.usdt) > parseInt(ethereumWithdrawRequests[i].data.receivedAmount)) {
                            databaseRef.child('system').child('ethereumWithdrawProcess').child(centralWallets[i].key).set({ wallet: centralWallets[i], data: ethereumWithdrawRequests[i] });
                            databaseRef.child('system').child('ethereumWithdrawRequests').child(ethereumWithdrawRequests[i].key).remove();
                            databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                            databaseRef.child('accounts').child(ethereumWithdrawRequests[i].data.uid).child('readable').child('statusWithdrawEthereum').set('STATUS_2');
                        } else {
                            databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').child(centralWallets[i].key).child('status').set('busy');
                        }
                    }
                }
            })
        })
    })

// firebase deploy --only functions:onSystemWithdrawBinanceProcess
exports.onSystemWithdrawBinanceProcess = functions.database.ref('/system/binanceWithdrawProcess/{key}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var data = snapshot.val();
        console.log('addressTo: ' + data.data.data.data.binanceAddress);
        console.log('privateKey: ' + data.wallet.data.privateKey);
        console.log('addressFrom: ' + data.wallet.data.publicAddress);
        console.log('amount: ' + data.data.data.data.amount);
        var centralBinancePrivateKeyWith0x = data.wallet.data.privateKey;
        var centralBinancePrivateKey = centralBinancePrivateKeyWith0x.split('0x')[1];
        var privKey = Buffer.from(centralBinancePrivateKey, 'hex');
        const addressFrom = data.wallet.data.publicAddress;
        const addressTo = data.data.data.data.binanceAddress;
        var aux0Amount = data.data.data.data.amount;
        var aux1Amount = parseInt(aux0Amount);
        databaseRef.child('publicSettings').child('transactionFees').child('bepWithdraw').once('value', bepWithdrawSnapshot => {
            databaseRef.child('publicSettings').child('transactionFees').child('bscGasPrice').once('value', bscGasPriceSnapshot => {
                var bscGasPrice = ''+bscGasPriceSnapshot.val();
                var bepWithdraw = parseInt(bepWithdrawSnapshot.val())*1000000000000;
                var aux2Amount = toFixed(aux1Amount) - toFixed(bepWithdraw);
                var aux3Amount = toFixed(aux2Amount);
                var amount = aux3Amount.toString();
                var dataField = bscContract.methods.transfer(addressTo, amount).encodeABI();
                console.log(dataField);
                web3BSC.eth.getTransactionCount(addressFrom, (err, txCount) => {
                    console.log('txCount: ' + txCount);
                    const txObject = {
                        nonce: web3BSC.utils.toHex(txCount),
                        to: contractBscUSDT,
                        value: web3BSC.utils.toHex(web3BSC.utils.toWei('0', 'ether')),
                        gasLimit: web3BSC.utils.toHex(210000),
                        gasPrice: web3BSC.utils.toHex(web3BSC.utils.toWei(bscGasPrice, 'gwei')),
                        data: dataField
                    };
                    console.log(txObject);
                    const tx = new Tx(txObject, { 'chain': 'mainnet' });
                    // // console.log(tx);
                    tx.sign(privKey);
                    const serializedTrans = tx.serialize();
                    const raw = '0x' + serializedTrans.toString('hex');
                    console.log(raw);
                    web3BSC.eth.sendSignedTransaction(raw, (err, txHash) => {
                        console.log('txHash:', txHash);
                        if (txHash) {
                            databaseRef.child('system').child('binanceWithdrawTransactions').child(txHash).set(txHash);
                        }
                        console.log(err);
                    });
                });
            });
        });
        return 0;
    })

// firebase deploy --only functions:onSystemWithdrawEthereumProcess
exports.onSystemWithdrawEthereumProcess = functions.database.ref('/system/ethereumWithdrawProcess/{key}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var data = snapshot.val();
        console.log('addressTo: ' + data.data.data.data.ethereumAddress);
        console.log('privateKey: ' + data.wallet.data.privateKey);
        console.log('addressFrom: ' + data.wallet.data.publicAddress);
        console.log('amount: ' + data.data.data.data.amount);
        var centralEthereumPrivateKeyWith0x = data.wallet.data.privateKey;
        var centralEthereumPrivateKey = centralEthereumPrivateKeyWith0x.split('0x')[1];
        var privKey = Buffer.from(centralEthereumPrivateKey, 'hex');
        const addressFrom = data.wallet.data.publicAddress;
        const addressTo = data.data.data.data.ethereumAddress;
        var aux0Amount = data.data.data.data.amount;
        var aux1Amount = parseInt(aux0Amount);
        databaseRef.child('publicSettings').child('transactionFees').child('ethWithdraw').once('value', ethWithdrawSnapshot => {
            databaseRef.child('publicSettings').child('transactionFees').child('ethGasPrice').once('value', ethGasPriceSnapshot => {
                var ethWithdraw = parseInt(ethWithdrawSnapshot.val());
                var ethGasPrice = ''+ethGasPriceSnapshot.val();
                var aux2Amount = toFixed(aux1Amount) - toFixed(ethWithdraw);
                var aux3Amount = toFixed(aux2Amount);
                var amount = aux3Amount.toString();
                console.log('done 1: '+amount);
                var dataField = ethContract.methods.transfer(addressTo, amount).encodeABI();
                console.log(dataField);
                web3ETH.eth.getTransactionCount(addressFrom, (err, txCount) => {
                    console.log('txCount: ' + txCount);
                    const txObject = {
                        nonce: web3ETH.utils.toHex(txCount),
                        to: contractEthUSDT,
                        value: web3ETH.utils.toHex(web3ETH.utils.toWei('0', 'ether')),
                        gasLimit: web3ETH.utils.toHex(210000),
                        gasPrice: web3ETH.utils.toHex(web3ETH.utils.toWei(ethGasPrice, 'gwei')),
                        data: dataField
                    };
                    console.log(txObject);
                    const tx = new Tx(txObject, { 'chain': 'mainnet' });
                    console.log(tx);
                    tx.sign(privKey);
                    const serializedTrans = tx.serialize();
                    const raw = '0x' + serializedTrans.toString('hex');
                    console.log(raw);
                    web3ETH.eth.sendSignedTransaction(raw, (err, txHash) => {
                        console.log('txHash:', txHash);
                        if (txHash) {
                            databaseRef.child('system').child('ethereumWithdrawTransactions').child(txHash).set(txHash);
                        }
                        console.log(err);
                    });
                });
            });
        });
        return 0;
    })

// firebase deploy --only functions:onSystemBinanceWithdrawTransactions
exports.onSystemBinanceWithdrawTransactions = functions.database.ref('/system/binanceWithdrawTransactions/{key}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var d = new Date();
        var n = d.getTime();
        console.log(data)
        return databaseRef.child('system').child('binanceWithdrawBuffer').child(data).once('value', transactionBafferSnapshot => {
            if (!transactionBafferSnapshot.val()) {
                databaseRef.child('system').child('auxArchiveBinanceTransactions').child(data).once('value', auxArchiveBinanceTransactionSnapshot => {
                    if (!auxArchiveBinanceTransactionSnapshot.val()) {
                        databaseRef.child('system').child('binanceWithdrawBuffer').child(data).set(data).then(() => {
                            databaseRef.child('system').child('auxArchiveBinanceTransactions').child(data).set(n).then(() => {
                                databaseRef.child('system').child('binanceWithdrawTransactions').child(context.params.key).remove();
                            })
                        })
                    } else {
                        databaseRef.child('system').child('binanceWithdrawTransactions').child(context.params.key).remove();
                    }
                })
            } else {
                databaseRef.child('system').child('binanceWithdrawTransactions').child(context.params.key).remove();
            }
        })
    })

// firebase deploy --only functions:onSystemEthereumWithdrawTransactions
exports.onSystemEthereumWithdrawTransactions = functions.database.ref('/system/ethereumWithdrawTransactions/{key}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var d = new Date();
        var n = d.getTime();
        console.log(data)
        return databaseRef.child('system').child('ethereumWithdrawBuffer').child(data).once('value', transactionBafferSnapshot => {
            if (!transactionBafferSnapshot.val()) {
                databaseRef.child('system').child('auxArchiveEthereumTransactions').child(data).once('value', auxArchiveEthereumTransactionSnapshot => {
                    if (!auxArchiveEthereumTransactionSnapshot.val()) {
                        databaseRef.child('system').child('ethereumWithdrawBuffer').child(data).set(data).then(() => {
                            databaseRef.child('system').child('auxArchiveEthereumTransactions').child(data).set(n).then(() => {
                                databaseRef.child('system').child('ethereumWithdrawTransactions').child(context.params.key).remove();
                            })
                        })
                    } else {
                        databaseRef.child('system').child('ethereumWithdrawTransactions').child(context.params.key).remove();
                    }
                })
            } else {
                databaseRef.child('system').child('ethereumWithdrawTransactions').child(context.params.key).remove();
            }
        })
    })

// firebase deploy --only functions:checkupSystemBinanceWithdrawBuffer
exports.checkupSystemBinanceWithdrawBuffer = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('binanceWithdrawProcess').once('value', binanceWithdrawProcessSnapshot => {
            var binanceWithdrawProcessArray = [];
            binanceWithdrawProcessSnapshot.forEach(processSnapshot => {
                var key = processSnapshot.key;
                var processData = processSnapshot.val();
                var centralWallet = processData.wallet.data.publicAddress;
                var receiverAddress = processData.data.data.data.binanceAddress;
                var amount = processData.data.data.data.amount;
                var uid = processData.data.data.uid;
                var receivedAmount = processData.data.data.receivedAmount;
                var senderAmount = processData.data.data.senderAmount;
                var language = processData.data.data.data.language;
                var timestamp = processData.data.key;
                binanceWithdrawProcessArray.push({
                    key: key,
                    centralWallet: centralWallet,
                    receiverAddress: receiverAddress,
                    uid: uid,
                    receivedAmount: receivedAmount,
                    senderAmount: senderAmount,
                    language: language,
                    timestamp: timestamp,
                    amount: amount
                });
            })
            databaseRef.child('system').child('binanceWithdrawBuffer').once('value', binanceWithdrawBuffersSnapshot => {
                var binanceWithdrawBuffers = [];
                binanceWithdrawBuffersSnapshot.forEach(binanceWithdrawBufferSnapshot => {
                    var transactionHash = binanceWithdrawBufferSnapshot.key;
                    console.log(transactionHash, binanceWithdrawProcessArray.length);
                    web3BSC.eth.getTransactionReceipt(transactionHash).then(resultTransactionHash => {
                        if ((resultTransactionHash.status == true) || (resultTransactionHash.status == 'true')) {
                            console.log(resultTransactionHash.from);
                            var internalFrom = resultTransactionHash.from;
                            var exist = false;
                            for (var i = 0; i < binanceWithdrawProcessArray.length; i++) {
                                var processDT = binanceWithdrawProcessArray[i];
                                if (internalFrom.toLowerCase() == processDT.centralWallet.toLowerCase()) {
                                    exist = true;
                                    console.log(transactionHash, internalFrom, processDT.key, processDT.language);
                                    databaseRef.child('system').child('binanceWithdrawFinish').child(transactionHash).set(processDT);
                                    databaseRef.child('accounts').child(processDT.uid).child('readable').child('statusWithdrawBinance').set('STATUS_3');
                                }
                            }
                            if (exist == false) {
                                databaseRef.child('system').child('binanceWithdrawBuffer').child(transactionHash).remove();
                            }
                        }
                        if ((resultTransactionHash.status == false) || (resultTransactionHash.status == 'false')) {
                        }
                    });
                });
            })
        })
    })
    
// firebase deploy --only functions:checkupSystemEthereumWithdrawBuffer
exports.checkupSystemEthereumWithdrawBuffer = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        return databaseRef.child('system').child('ethereumWithdrawProcess').once('value', ethereumWithdrawProcessSnapshot => {
            var ethereumWithdrawProcessArray = [];
            ethereumWithdrawProcessSnapshot.forEach(processSnapshot => {
                var key = processSnapshot.key;
                var processData = processSnapshot.val();
                var centralWallet = processData.wallet.data.publicAddress;
                var receiverAddress = processData.data.data.data.ethereumAddress;
                var amount = processData.data.data.data.amount;
                var uid = processData.data.data.uid;
                var receivedAmount = processData.data.data.receivedAmount;
                var senderAmount = processData.data.data.senderAmount;
                var language = processData.data.data.data.language;
                var timestamp = processData.data.key;
                ethereumWithdrawProcessArray.push({
                    key: key,
                    centralWallet: centralWallet,
                    receiverAddress: receiverAddress,
                    uid: uid,
                    receivedAmount: receivedAmount,
                    senderAmount: senderAmount,
                    language: language,
                    timestamp: timestamp,
                    amount: amount
                });
            })
            databaseRef.child('system').child('ethereumWithdrawBuffer').once('value', ethereumWithdrawBuffersSnapshot => {
                var ethereumWithdrawBuffers = [];
                ethereumWithdrawBuffersSnapshot.forEach(ethereumWithdrawBufferSnapshot => {
                    var transactionHash = ethereumWithdrawBufferSnapshot.key;
                    console.log(transactionHash, ethereumWithdrawProcessArray.length);
                    web3ETH.eth.getTransactionReceipt(transactionHash).then(resultTransactionHash => {
                        if ((resultTransactionHash.status == true) || (resultTransactionHash.status == 'true')) {
                            console.log(resultTransactionHash.from);
                            var internalFrom = resultTransactionHash.from;
                            var exist = false;
                            for (var i = 0; i < ethereumWithdrawProcessArray.length; i++) {
                                var processDT = ethereumWithdrawProcessArray[i];
                                if (internalFrom.toLowerCase() == processDT.centralWallet.toLowerCase()) {
                                    exist = true;
                                    console.log(transactionHash, internalFrom, processDT.key, processDT.language);
                                    databaseRef.child('system').child('ethereumWithdrawFinish').child(transactionHash).set(processDT);
                                    databaseRef.child('accounts').child(processDT.uid).child('readable').child('statusWithdrawEthereum').set('STATUS_3');
                                }
                            }
                            if (exist == false) {
                                databaseRef.child('system').child('ethereumWithdrawBuffer').child(transactionHash).remove();
                            }
                        }
                        if ((resultTransactionHash.status == false) || (resultTransactionHash.status == 'false')) {
                        }
                    });
                });
            })
        })
    })

// firebase deploy --only functions:onSystemBinanceWithdrawFinish
exports.onSystemBinanceWithdrawFinish = functions.database.ref('/system/binanceWithdrawFinish/{hashKey}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var hashKey = context.params.hashKey;
        console.log(hashKey, data.key);
        databaseRef.child('system').child('binanceWithdrawBuffer').child(hashKey).remove().then(() => {
            databaseRef.child('system').child('binanceWithdrawProcess').child(data.key).remove().then(() => {
                databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').child(data.key).child('status').set('available').then(() => {
                    databaseRef.child('walletActions').child(data.uid).child(data.timestamp).set(data.senderAmount).then(() => {
                        databaseRef.child('accounts').child(data.uid).child('readable').child('walletActions').child(data.timestamp).set(data.senderAmount).then(() => {
                            databaseRef.child('accounts').child(data.uid).child('readable').child('busy').set(false).then(() => {
                                databaseRef.child('accounts').child(data.uid).child('readable').child('statusWithdrawBinance').remove().then(() => {
                                    databaseRef.child('historic').child('transactions').child(data.uid).child(data.timestamp).set({ timestamp: data.timestamp, type: 'withdrawBEP20', bscAddress: data.receiverAddress, amount: data.senderAmount, receivedAmount: data.receivedAmount }).then(() => {
                                        databaseRef.child('archive').child('transactions').child(data.timestamp).set({ timestamp: data.timestamp, type: 'withdrawBEP20', sender: data.uid, bscAddress: data.receiverAddress, amount: data.senderAmount, receivedAmount: data.receivedAmount }).then(() => {
                                            databaseRef.child('messages').child(data.language).child('onRequestWithdrawBinanceUSDT').once('value', messageSnapshot => {
                                                var messageObject = messageSnapshot.val();
                                                databaseRef.child('accounts').child(data.uid).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: data.timestamp, success: true }).then(() => {
                                                    databaseRef.child('/system/binanceWithdrawFinish/' + context.params.hashKey).remove();
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

// firebase deploy --only functions:onSystemEthereumWithdrawFinish
exports.onSystemEthereumWithdrawFinish = functions.database.ref('/system/ethereumWithdrawFinish/{hashKey}')
    .onCreate((snapshot, context) => {
        var data = snapshot.val();
        var hashKey = context.params.hashKey;
        console.log(hashKey, data.key);
        databaseRef.child('system').child('ethereumWithdrawBuffer').child(hashKey).remove().then(() => {
            databaseRef.child('system').child('ethereumWithdrawProcess').child(data.key).remove().then(() => {
                databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').child(data.key).child('status').set('available').then(() => {
                    databaseRef.child('walletActions').child(data.uid).child(data.timestamp).set(data.senderAmount).then(() => {
                        databaseRef.child('accounts').child(data.uid).child('readable').child('walletActions').child(data.timestamp).set(data.senderAmount).then(() => {
                            databaseRef.child('accounts').child(data.uid).child('readable').child('busy').set(false).then(() => {
                                databaseRef.child('accounts').child(data.uid).child('readable').child('statusWithdrawEthereum').remove().then(() => {
                                    databaseRef.child('historic').child('transactions').child(data.uid).child(data.timestamp).set({ timestamp: data.timestamp, type: 'withdrawETH20', ethAddress: data.receiverAddress, amount: data.senderAmount, receivedAmount: data.receivedAmount }).then(() => {
                                        databaseRef.child('archive').child('transactions').child(data.timestamp).set({ timestamp: data.timestamp, type: 'withdrawETH20', sender: data.uid, ethAddress: data.receiverAddress, amount: data.senderAmount, receivedAmount: data.receivedAmount }).then(() => {
                                            databaseRef.child('messages').child(data.language).child('onRequestWithdrawEthereumUSDT').once('value', messageSnapshot => {
                                                var messageObject = messageSnapshot.val();
                                                databaseRef.child('accounts').child(data.uid).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: data.timestamp, success: true }).then(() => {
                                                    databaseRef.child('/system/ethereumWithdrawFinish/' + context.params.hashKey).remove();
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

// firebase deploy --only functions:checkupUsdtWithdrawBscCentralWallets
exports.checkupUsdtWithdrawBscCentralWallets = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').once('value', usdtWithdrawBscCentralWalletsSnapshot => {
            usdtWithdrawBscCentralWalletsSnapshot.forEach(usdtWithdrawBscCentralWalletSnapshot => {
                var data = usdtWithdrawBscCentralWalletSnapshot.val();
                function getContractBalance(walletAddressParam, walletIdParam) {
                    try {
                        bscContract.methods.balanceOf(walletAddressParam).call().then(resultUsdtBalance => {
                            web3BSC.eth.getBalance(walletAddressParam).then(resultBnbBalance => {
                                console.log(walletIdParam, walletAddressParam, Number(resultUsdtBalance).toString(), Number(resultBnbBalance).toString());
                                databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').child(walletIdParam).child('bnb').set(toFixed(Number(resultBnbBalance)).toString());
                                databaseRef.child('privateSettings').child('usdtWithdrawBscCentralWallets').child(walletIdParam).child('usdt').set(toFixed(Number(resultUsdtBalance)).toString());
                            })
                        })
                    } catch (error) {
                        console.error("trigger smart contract error");
                    }
                }
                getContractBalance(data.publicAddress, usdtWithdrawBscCentralWalletSnapshot.key);
            })
        });

        databaseRef.child('privateSettings').child('bnbWithdrawBscCentralWallets').once('value', bnbWithdrawBscCentralWalletsSnapshot => {
            bnbWithdrawBscCentralWalletsSnapshot.forEach(bnbWithdrawBscCentralWalletSnapshot => {
                var data = bnbWithdrawBscCentralWalletSnapshot.val();
                function getBalance(walletAddressParam, walletIdParam) {
                    try {
                        web3BSC.eth.getBalance(walletAddressParam).then(resultBnbBalance => {
                            console.log(walletIdParam, walletAddressParam, Number(resultBnbBalance).toString());
                            databaseRef.child('privateSettings').child('bnbWithdrawBscCentralWallets').child(walletIdParam).child('bnb').set(toFixed(Number(resultBnbBalance)).toString());
                        })
                    } catch (error) {
                        console.error("trigger smart contract error");
                    }
                }
                getBalance(data.publicAddress, bnbWithdrawBscCentralWalletSnapshot.key);
            })
        });
        return null;
    })

// firebase deploy --only functions:checkupUsdtWithdrawEthCentralWallets
exports.checkupUsdtWithdrawEthCentralWallets = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').once('value', usdtWithdrawEthCentralWalletsSnapshot => {
            usdtWithdrawEthCentralWalletsSnapshot.forEach(usdtWithdrawEthCentralWalletSnapshot => {
                var data = usdtWithdrawEthCentralWalletSnapshot.val();
                function getContractBalance(walletAddressParam, walletIdParam) {
                    try {
                        ethContract.methods.balanceOf(walletAddressParam).call().then(resultUsdtBalance => {
                            web3ETH.eth.getBalance(walletAddressParam).then(resultEthBalance => {
                                console.log(walletIdParam, walletAddressParam, Number(resultUsdtBalance).toString(), Number(resultEthBalance).toString());
                                databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').child(walletIdParam).child('eth').set(toFixed(Number(resultEthBalance)).toString());
                                databaseRef.child('privateSettings').child('usdtWithdrawEthCentralWallets').child(walletIdParam).child('usdt').set(toFixed(Number(resultUsdtBalance)).toString());
                            })
                        })
                    } catch (error) {
                        console.error("trigger smart contract error");
                    }
                }
                getContractBalance(data.publicAddress, usdtWithdrawEthCentralWalletSnapshot.key);
            })
        });

        databaseRef.child('privateSettings').child('ethWithdrawEthCentralWallets').once('value', ethWithdrawEthCentralWalletsSnapshot => {
            ethWithdrawEthCentralWalletsSnapshot.forEach(ethWithdrawEthCentralWalletSnapshot => {
                var data = ethWithdrawEthCentralWalletSnapshot.val();
                function getBalance(walletAddressParam, walletIdParam) {
                    try {
                        web3ETH.eth.getBalance(walletAddressParam).then(resultEthBalance => {
                            console.log(walletIdParam, walletAddressParam, Number(resultEthBalance).toString());
                            databaseRef.child('privateSettings').child('ethWithdrawEthCentralWallets').child(walletIdParam).child('eth').set(toFixed(Number(resultEthBalance)).toString());
                        })
                    } catch (error) {
                        console.error("trigger smart contract error");
                    }
                }
                getBalance(data.publicAddress, ethWithdrawEthCentralWalletSnapshot.key);
            })
        });
        return null;
    })

// firebase deploy --only functions:onRequestRequestMerchantApiKey
exports.onRequestRequestMerchantApiKey = functions.database.ref('/requests/requestMerchantApiKey/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestRequestMerchantApiKey').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestRequestMerchantApiKey').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('username').once('value', usernameSnapshot => {
                    if (usernameSnapshot.val()) {
                        var newApiKey = 'USDTIFY-APIKEY---' + generateApiKey({ method: 'string', length: 32, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' });
                        console.log(newApiKey);
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('merchantApiKeys').child(newApiKey).set(newApiKey).then(() => {
                            databaseRef.child('merchantApiKeys').child(newApiKey).set(context.params.accnountID).then(() => {
                                databaseRef.child('/requests/requestMerchantApiKey/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                });
                            })
                        })
                    }
                    else {
                        databaseRef.child('/requests/requestMerchantApiKey/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.usernameRequired.message, timestamp: n, success: false });
                        });
                    }
                })
            });
        });
    })

// firebase deploy --only functions:onRequestRevokeMerchantApiKey
exports.onRequestRevokeMerchantApiKey = functions.database.ref('/requests/revokeMerchantApiKey/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestRevokeMerchantApiKey').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestRevokeMerchantApiKey').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();

                if (semiOriginal['apiKey']) {

                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('merchantApiKeys').child(semiOriginal.apiKey).once('value', apiKeySnapshot => {
                        if (apiKeySnapshot.val()) {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('merchantApiKeys').child(semiOriginal.apiKey).remove().then(() => {
                                databaseRef.child('merchantApiKeys').child(semiOriginal.apiKey).remove().then(() => {
                                    databaseRef.child('activeOrdersApiKey').child(semiOriginal.apiKey).remove().then(() => {
                                        databaseRef.child('/requests/revokeMerchantApiKey/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                        });
                                    });
                                });
                            });
                        }
                        else {
                            databaseRef.child('/requests/revokeMerchantApiKey/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidApiKey.message, timestamp: n, success: false });
                            });
                        }
                    })
                }
                else {
                    databaseRef.child('/requests/revokeMerchantApiKey/' + context.params.accnountID).remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidApiKey.message, timestamp: n, success: false });
                    });
                }
            });
        });
    })

// firebase deploy --only functions:onRequestRequestPaymentCard
exports.onRequestRequestPaymentCard = functions.database.ref('/requests/requestPaymentCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestPaymentCard').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestRequestPaymentCard').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('username').once('value', usernameSnapshot => {
                    if (usernameSnapshot.val()) {
                        var newRandom = Math.floor(Math.random() * (999 - 100 + 1) + 100);
                        var serialNumber = n.toString() + "" + newRandom.toString();
                        var pinCode = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
                        var csc = Math.floor(Math.random() * (999 - 100 + 1) + 100);
                        console.log(serialNumber, pinCode, csc);
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(serialNumber).set({ serialNumber: serialNumber, csc: csc, pinCode: pinCode, balance: '0' }).then(() => {
                            databaseRef.child('paymentCards').child(serialNumber).set({ uid: context.params.accnountID, csc: csc, pinCode: pinCode, balance: '0' }).then(() => {
                                databaseRef.child('/requests/requestPaymentCard/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                });
                            });
                        })
                    }
                    else {
                        databaseRef.child('/requests/requestPaymentCard/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.usernameRequired.message, timestamp: n, success: false });
                        });
                    }
                })
            });
        });
    })

// firebase deploy --only functions:onRequestRevokePaymentCard
exports.onRequestRevokePaymentCard = functions.database.ref('/requests/revokePaymentCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestRevokePaymentCard').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestRevokePaymentCard').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                if ((semiOriginal['serialNumber']) && (semiOriginal['pinCode'])) {
                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).once('value', serialNumberSnapshot => {
                        if (serialNumberSnapshot.val()) {
                            var snapshotData = serialNumberSnapshot.val();
                            if (parseInt(snapshotData.pinCode) == parseInt(semiOriginal.pinCode)) {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).remove().then(() => {
                                    databaseRef.child('paymentCards').child(semiOriginal.serialNumber).remove().then(() => {
                                        databaseRef.child('/requests/revokePaymentCard/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                        });
                                    });
                                });
                            }
                            else {
                                databaseRef.child('/requests/revokePaymentCard/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                                });
                            }
                        }
                        else {
                            databaseRef.child('/requests/revokePaymentCard/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                            });
                        }
                    })
                }
                else {
                    databaseRef.child('/requests/revokePaymentCard/' + context.params.accnountID).remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                    });
                }
            });
        });
    })

// firebase deploy --only functions:onRequestChangePaymentCard
exports.onRequestChangePaymentCard = functions.database.ref('/requests/changePinCodePaymentCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        console.log(semiOriginal);
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestChangePaymentCard').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestChangePaymentCard').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                if ((semiOriginal['serialNumber']) && (semiOriginal['pinCode'])) {
                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).once('value', serialNumberSnapshot => {
                        if (serialNumberSnapshot.val()) {
                            var snapshotData = serialNumberSnapshot.val();
                            if (parseInt(snapshotData.pinCode) == parseInt(semiOriginal.pinCode)) {
                                var newPinCode = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).child('pinCode').set(newPinCode).then(() => {
                                    databaseRef.child('paymentCards').child(semiOriginal.serialNumber).child('pinCode').set(newPinCode).then(() => {
                                        databaseRef.child('/requests/requestPaymentCard/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                        });
                                    });
                                    databaseRef.child('/requests/changePinCodePaymentCard/' + context.params.accnountID).remove().then(() => {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                    });
                                });
                            }
                            else {
                                databaseRef.child('/requests/changePinCodePaymentCard/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                                });
                            }
                        }
                        else {
                            databaseRef.child('/requests/changePinCodePaymentCard/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                            });
                        }
                    })
                }
                else {
                    databaseRef.child('/requests/changePinCodePaymentCard/' + context.params.accnountID).remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                    });
                }
            });
        });
    })

// firebase deploy --only functions:onRequestTopupPaymentCardWallet
exports.onRequestTopupPaymentCardWallet = functions.database.ref('/requests/topupPaymentCardWallet/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestTopupPaymentCardWallet').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestTopupPaymentCardWallet').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                if ((semiOriginal['serialNumber']) && (semiOriginal['amount'])) {
                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).once('value', serialNumberSnapshot => {
                        if (serialNumberSnapshot.val()) {
                            var paymentCardData = serialNumberSnapshot.val();
                            if (isNumeric(semiOriginal.amount)) {
                                var amountData = parseInt(semiOriginal.amount);
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                    if (balanceSnapshot.val()) {
                                        var balanceData = parseInt(balanceSnapshot.val());
                                        console.log(balanceData, amountData);
                                        if (balanceData >= amountData) {
                                            var amountToWithdraw = '-' + amountData;
                                            databaseRef.child('walletActions').child(context.params.accnountID).child(n).set(amountToWithdraw).then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(n).set(amountToWithdraw).then(() => {
                                                    databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ timestamp: n, type: 'topupDepositCard', depositCard: semiOriginal.serialNumber, amount: amountToWithdraw }).then(() => {
                                                        // databaseRef.child('archive').child('transactions').child(n).set({ timestamp: n, type: 'transferUSDT', sender: sender, receiver: receiver, amount: senderAmount, fees: transactionFeesVersionOneSnapshot.val() }).then(() => {
                                                        var oldPaymentCardBalance = parseInt(paymentCardData.balance);
                                                        var newPaymentCardBalance = '' + (oldPaymentCardBalance + amountData);
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).child('balance').set(newPaymentCardBalance).then(() => {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {
                                                                databaseRef.child('/requests/topupPaymentCardWallet/' + context.params.accnountID).remove();
                                                            });
                                                        });
                                                        // });
                                                    });
                                                });
                                            });
                                        }
                                        else {
                                            databaseRef.child('/requests/topupPaymentCardWallet/' + context.params.accnountID).remove().then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                            });
                                        }
                                    }
                                    else {
                                        databaseRef.child('/requests/topupPaymentCardWallet/' + context.params.accnountID).remove().then(() => {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                        });
                                    }
                                });
                                // databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('patmentCards').child(semiOriginal.serialNumber).child('pinCode').set(newPinCode).then(() => {
                                //     databaseRef.child('paymentCards').child(semiOriginal.serialNumber).child('pinCode').set(newPinCode).then(() => {
                                //         databaseRef.child('/requests/requestPaymentCard/' + context.params.accnountID).remove().then(() => {
                                //             databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                //         });
                                //     });
                                //     databaseRef.child('/requests/changePinCodePaymentCard/' + context.params.accnountID).remove().then(() => {
                                //         databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true });
                                //     });
                                // });
                            }
                            else {
                                databaseRef.child('/requests/topupPaymentCardWallet/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                                });
                            }
                        }
                        else {
                            databaseRef.child('/requests/topupPaymentCardWallet/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                            });
                        }
                    })
                }
                else {
                    databaseRef.child('/requests/topupPaymentCardWallet/' + context.params.accnountID).remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                    });
                }
            });
        });
    })

// firebase deploy --only functions:onRequestRedeemPaymentCard
exports.onRequestRedeemPaymentCard = functions.database.ref('/requests/redeemPaymentCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestRedeemPaymentCard').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('messages').child(mainLanguage).child('onRequestRedeemPaymentCard').once('value', messageSnapshot => {
                var messageObject = messageSnapshot.val();
                if ((semiOriginal['serialNumber']) && (semiOriginal['amount'])) {
                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).once('value', serialNumberSnapshot => {
                        if (serialNumberSnapshot.val()) {
                            var paymentCardData = serialNumberSnapshot.val();
                            if (isNumeric(semiOriginal.amount)) {
                                var amountData = parseInt(semiOriginal.amount);
                                var prepaidcardBalance = parseInt(paymentCardData.balance);
                                if (prepaidcardBalance >= amountData) {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                        if (balanceSnapshot.val()) {
                                            var balanceData = parseInt(balanceSnapshot.val());
                                            console.log(paymentCardData.balance, amountData, balanceData, paymentCardData.serialNumber, paymentCardData.pinCode);

                                            var amountToDeposit = '' + amountData;
                                            databaseRef.child('walletActions').child(context.params.accnountID).child(n).set(amountToDeposit).then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(n).set(amountToDeposit).then(() => {
                                                    
                                                    databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ timestamp: n, type: 'redeemDepositCard', depositCard: paymentCardData.serialNumber, amount: amountToDeposit }).then(() => {
                                                        var newPaymentCardBalance = '' + (prepaidcardBalance - amountData);
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('paymentCards').child(semiOriginal.serialNumber).child('balance').set(newPaymentCardBalance).then(() => {
                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {
                                                                databaseRef.child('/requests/redeemPaymentCard/' + context.params.accnountID).remove();
                                                            });
                                                        });
                                                    });
                                                    // databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ timestamp: n, type: 'sendUSDT', receiver: receiver, amount: senderAmount, fees: transactionFeesVersionOneSnapshot.val() }).then(() => {
                                                    // databaseRef.child('archive').child('transactions').child(n).set({ timestamp: n, type: 'transferUSDT', sender: sender, receiver: receiver, amount: senderAmount, fees: transactionFeesVersionOneSnapshot.val() }).then(() => {
                                                    // var oldPaymentCardBalance = parseInt(paymentCardData.balance);

                                                    // });
                                                    // });
                                                });
                                            });
                                        }
                                        else {
                                            databaseRef.child('/requests/redeemPaymentCard/' + context.params.accnountID).remove().then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                            });
                                        }
                                    });
                                }
                                else {
                                    databaseRef.child('/requests/redeemPaymentCard/' + context.params.accnountID).remove().then(() => {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                    });
                                }
                            }
                            else {
                                databaseRef.child('/requests/redeemPaymentCard/' + context.params.accnountID).remove().then(() => {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                                });
                            }
                        }
                        else {
                            databaseRef.child('/requests/redeemPaymentCard/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                            });
                        }
                    })
                }
                else {
                    databaseRef.child('/requests/redeemPaymentCard/' + context.params.accnountID).remove().then(() => {
                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.notValidData.message, timestamp: n, success: false });
                    });
                }
            });
        });
    })

// firebase deploy --only functions:onRequestTransferToDepositCard
exports.onRequestTransferToDepositCard = functions.database.ref('/requests/transferToDepositCard/{accnountID}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var semiOriginal = snapshot.val();
        var mainLanguage = 'EN';
        if (semiOriginal['language']) {
            mainLanguage = semiOriginal['language'];
        }
        return databaseRef.child('forAdmin').child('requestTransferToDepositCard').child(n).set({ uid: context.params.accnountID, data: semiOriginal }).then(() => {
            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('timestamp').set(n).then(() => {
                databaseRef.child('messages').child(mainLanguage).child('onRequestTransferToDepositCard').once('value', messageSnapshot => {
                    var messageObject = messageSnapshot.val();
                    if (semiOriginal['amount'] && semiOriginal['serialNumber']) {
                        var amountData = semiOriginal['amount'];
                        var serialNumber = semiOriginal['serialNumber'];
                        if (isNumeric(amountData)) {
                            databaseRef.child('publicSettings').child('usdtifyBlock').child('status').once('value', usdtifyBlockSnapshot => {
                                if (usdtifyBlockSnapshot.val() != true) {
                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').once('value', walletActionsSnapshot => {
                                        if (!walletActionsSnapshot.val()) {
                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('busy').once('value', busySnapshot => {
                                                if (busySnapshot.val() != true) {
                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('balance').once('value', balanceSnapshot => {
                                                        if (balanceSnapshot.val()) {
                                                            var balance = parseInt(balanceSnapshot.val());
                                                            var amount = parseInt(amountData);
                                                            if (amount > 0) {
                                                                if (balance >= amount) {
                                                                    databaseRef.child('paymentCards').child(serialNumber).once('value', receiverSerialNumberSnapshot => {
                                                                        if (receiverSerialNumberSnapshot.val()) {
                                                                            var depositCardData = receiverSerialNumberSnapshot.val();
                                                                            var depositCardOwner = depositCardData.uid;
                                                                            databaseRef.child('accounts').child(depositCardOwner).child('readable').child('paymentCards').child(serialNumber).once('value', internalSerialNumberSnapshot => {
                                                                                if (internalSerialNumberSnapshot.val()) {
                                                                                    var paymentCardData = internalSerialNumberSnapshot.val();
                                                                                    databaseRef.child('publicSettings').child('transactionFees').child('versionOne').once('value', transactionFeesVersionOneSnapshot => {
                                                                                        var transactionFeesVersionOne = 0;
                                                                                        if (transactionFeesVersionOneSnapshot.val()) {
                                                                                            transactionFeesVersionOne = parseInt(transactionFeesVersionOneSnapshot.val());
                                                                                        }
                                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('username').once('value', senderSnapshot => {
                                                                                            var sender = senderSnapshot.val();
                                                                                            var senderAmount = '-' + amount;

                                                                                            if ((amount - transactionFeesVersionOne) > 0) {
                                                                                                var receiverAmount = parseInt(amount - transactionFeesVersionOne);

                                                                                                databaseRef.child('walletActions').child(context.params.accnountID).child(n).set(senderAmount).then(() => {
                                                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('walletActions').child(n).set(senderAmount).then(() => {
                                                                                                        var oldPaymentCardBalance = parseInt(paymentCardData.balance);
                                                                                                        var newPaymentCardBalance = '' + (oldPaymentCardBalance + receiverAmount);
                                                                                                        databaseRef.child('accounts').child(depositCardOwner).child('readable').child('paymentCards').child(semiOriginal.serialNumber).child('balance').set(newPaymentCardBalance).then(() => {
                                                                                                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.success.message, timestamp: n, success: true }).then(() => {
                                                                                                                // databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ , , ,  }).then(() => {
                                                                                                                // databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ timestamp: n, type: 'redeemDepositCard', depositCard: paymentCardData.serialNumber, amount: amountToDeposit }).then(() => {
                                                                                                                databaseRef.child('historic').child('transactions').child(context.params.accnountID).child(n).set({ timestamp: n, type: 'transferToDepositCard', depositCard: serialNumber, amount: senderAmount}).then(() => {
                                                                                                                    databaseRef.child('historic').child('transactions').child(depositCardOwner).child(n).set({ timestamp: n, type: 'receiveToDepositCard', depositCard: serialNumber, amount: receiverAmount, sender: sender}).then(() => {
                                                                                                                        databaseRef.child('/requests/transferToDepositCard/' + context.params.accnountID).remove();
                                                                                                                    });
                                                                                                                });
                                                                                                            });
                                                                                                        });

                                                                                                    });
                                                                                                });
                                                                                            }
                                                                                        })
                                                                                    })
                                                                                } else {
                                                                                    databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidUsername.message, timestamp: n, success: false });
                                                                                    });
                                                                                }
                                                                            })
                                                                        }
                                                                        else {
                                                                            databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.invalidSerialNumber.message, timestamp: n, success: false });
                                                                            });
                                                                        }
                                                                    });
                                                                } else {
                                                                    databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                                    });
                                                                }
                                                            } else {
                                                                databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                    databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                                                                });
                                                            }
                                                        } else {
                                                            databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.noEnoughBalance.message, timestamp: n, success: false });
                                                            });
                                                        }
                                                    })
                                                } else {
                                                    databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                                    });
                                                }
                                            })
                                        } else {
                                            databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                            });
                                        }
                                    })
                                } else {
                                    databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                        databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.multipleTransactions.message, timestamp: n, success: false });
                                    });
                                }
                            })
                        } else {
                            databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                                databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                            });
                        }
                    } else {
                        databaseRef.child('/requests/transferUSDT/' + context.params.accnountID).remove().then(() => {
                            databaseRef.child('accounts').child(context.params.accnountID).child('readable').child('tenSecondNotification').set({ message: messageObject.badFormatAmount.message, timestamp: n, success: false });
                        });
                    }
                })
            })
        });
    })

// firebase deploy --only functions:onCreateRequestedInvoices
exports.onCreateRequestedInvoices = functions.database.ref('/requestedInvoices/{apiKey}/{requestKey}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var requestData = snapshot.val();
        return databaseRef.child('merchantApiKeys').child(context.params.apiKey).once('value', uidDataSnapshot => {
            if (uidDataSnapshot.val()) {
                var orderID = n;
                var merchantUID = uidDataSnapshot.val();
                requestData.merchantUID = merchantUID;
                requestData.orderID = orderID;
                requestData.apiKey = context.params.apiKey;
                databaseRef.child('activeOrders').child(orderID).set(requestData).then(() => {
                    databaseRef.child('activeOrdersApiKey').child(context.params.apiKey).child(orderID).set(requestData).then(() => {
                        databaseRef.child('requestedInvoices').child(context.params.apiKey).child(context.params.requestKey).remove();
                    })
                })
            }
            else {
                databaseRef.child('requestedInvoices').child(context.params.apiKey).child(context.params.requestKey).remove();
            }
        });
    })

// firebase deploy --only functions:onDeleteActiveOrdersApiKey
exports.onDeleteActiveOrdersApiKey = functions.database.ref('/activeOrdersApiKey/{apiKey}/{orderId}')
    .onDelete((oldData, context) => {
        return databaseRef.child('activeOrders').child(context.params.orderId).remove();
    })

// firebase deploy --only functions:onCreatePaymentPaymentCardRequest
exports.onCreatePaymentPaymentCardRequest = functions.database.ref('/paymentPaymentCardRequest/{paymentOrderKey}')
    .onCreate((snapshot, context) => {
        var d = new Date();
        var n = d.getTime();
        var requestData = snapshot.val();
        var card_number = requestData.card_number;
        var cvc = requestData.cvc;
        var pay_id = requestData.pay_id;
        return databaseRef.child('paymentCards').child(card_number).once('value', paymentCardSnapshot => {
            var paymentCardData = paymentCardSnapshot.val();
            if (paymentCardData) {
                if (cvc == paymentCardData.csc) {
                    console.log(paymentCardData.uid);
                    var theUID = paymentCardData.uid;
                    if (theUID) {
                        databaseRef.child('accounts').child(theUID).child('readable').child('paymentCards').child(card_number).once('value', userPaymentCardSnapshot => {
                            if (userPaymentCardSnapshot.val()) {
                                var userCardNumberData = userPaymentCardSnapshot.val();
                                if (userCardNumberData.csc == cvc) {
                                    var userPaymentCardBalance = parseInt(userCardNumberData.balance);
                                    databaseRef.child('activeOrders').child(pay_id).child('txInfo').once('value', txInfoSnapshot => {
                                        if (txInfoSnapshot.val()) {
                                            var txInfoData = txInfoSnapshot.val();
                                            // .child('totalUSDT')
                                            var paymentAmount = parseInt(txInfoData.totalUSDT);
                                            if (userPaymentCardBalance >= paymentAmount) {
                                                var userPaymentCardNewBalance = '' + (userPaymentCardBalance - paymentAmount);
                                                console.log('11111111');
                                                databaseRef.child('activeOrders').child(pay_id).child('apiKey').once('value', apiKeySnapshot => {
                                                    if (apiKeySnapshot.val()) {
                                                        var apiKeyData = apiKeySnapshot.val();
                                                        // /merchantApiKeys/USDTIFY-APIKEY---04TyWslQQ1Z9EmguCkHUgdwW0Hyox9DH
                                                        databaseRef.child('merchantApiKeys').child(apiKeyData).once('value', merchantUIDSnapshot => {
                                                            if (merchantUIDSnapshot.val()) {
                                                                var merchantUID = merchantUIDSnapshot.val();
                                                                databaseRef.child('publicSettings').child('merchant').child('percentageFees').once('value', percentageFeesSnapshot => {
                                                                    var percentageFees = percentageFeesSnapshot.val();
                                                                    var exactFees = parseInt(percentageFees * paymentAmount / 100);
                                                                    var exactReceived = paymentAmount - exactFees;
                                                                    
                                                                    databaseRef.child('walletActions').child(merchantUID).child(n).set(exactReceived).then(() => {
                                                                        databaseRef.child('accounts').child(merchantUID).child('readable').child('walletActions').child(n).set(exactReceived).then(() => {
                                                                            databaseRef.child('paidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, txInfo: txInfoData }).then(() => {
                                                                                console.log('22222222');
                                                                                databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove().then(() => {
                                                                                    console.log('33333333');
                                                                                    databaseRef.child('activeOrders').child(context.params.paymentOrderKey).remove().then(() => {
                                                                                        console.log('44444444');
                                                                                        databaseRef.child('accounts').child(theUID).child('readable').child('paymentCards').child(card_number).child('balance').set(userPaymentCardNewBalance).then(() => {
                                                                                            console.log('555555555');
                                                                                            databaseRef.child('historic').child('transactions').child(theUID).child(n).set({ timestamp: n, type: 'payByDepositCard', depositCard: card_number, amount: paymentAmount, orderID: context.params.paymentOrderKey}).then(() => {
                                                                                                console.log('6666666666');
                                                                                                databaseRef.child('historic').child('transactions').child(merchantUID).child(n).set({ timestamp: n, type: 'sellByDepositCard', depositCard: card_number, amount: exactReceived, orderID: context.params.paymentOrderKey}).then(() => {
                                                                                                    databaseRef.child('failurePaidOrders').child(pay_id).remove();
                                                                                                });
                                                                                            });

                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        });
                                                                    });
                                                                    
                                                                });
                                                            }
                                                            else {
                                                                databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status3' }).then(() => {
                                                                    databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                                                                })
                                                            }
                                                        })
                                                    }
                                                    else {
                                                        databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status3' }).then(() => {
                                                            databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                                                        })
                                                    }
                                                })
                                            }
                                            else {
                                                databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status1' }).then(() => {
                                                    databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                                                })
                                            }
                                        }
                                        else {
                                            databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status2' }).then(() => {
                                                databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                                            })
                                        }
                                    })
                                }
                                else {
                                    databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status2' }).then(() => {
                                        databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                                    })
                                }
                            }
                            else {
                                databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status2' }).then(() => {
                                    databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                                })
                            }
                        })
                    }
                    else {
                        databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status2' }).then(() => {
                            databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                        })
                    }
                }
                else {
                    databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status2' }).then(() => {
                        databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                    })
                }
            }
            else {
                databaseRef.child('failurePaidOrders').child(pay_id).set({ type: 'paymentCard', data: requestData, date: n, status: 'status2' }).then(() => {
                    databaseRef.child('paymentPaymentCardRequest').child(context.params.paymentOrderKey).remove();
                })
            }
        })
    })

// firebase deploy --only functions:checkupGasPrice
exports.checkupGasPrice = functions.pubsub.schedule('every 1 minutes')
    .onRun((context) => {
        https.get(urlETHEREUM,(res) => {
            let body = "";
        
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                try {
                    let json = JSON.parse(body);
                    console.log(json.result.SafeGasPrice);
                    var gasPrice = ''+json.result.SafeGasPrice
                    databaseRef.child('publicSettings').child('transactionFees').child('ethGasPrice').set(gasPrice).then(() => {
                        // databaseRef.child('publicSettings').child('transactionFees').child('bscGasPrice').set(gasPrice)
                    })
                } catch (error) {
                    console.error(error.message);
                };
            });
        
        }).on("error", (error) => {
            console.error(error.message);
        });

        https.get(urlBINANCE,(res) => {
            let body = "";
        
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                try {
                    let json = JSON.parse(body);
                    console.log(json.result.SafeGasPrice);
                    var gasPrice = ''+json.result.SafeGasPrice
                    databaseRef.child('publicSettings').child('transactionFees').child('bscGasPrice').set(gasPrice).then(() => {
                        // databaseRef.child('publicSettings').child('transactionFees').child('bscGasPrice').set(gasPrice)
                    })
                } catch (error) {
                    console.error(error.message);
                };
            });
        
        }).on("error", (error) => {
            console.error(error.message);
        });
        return null;
    })
