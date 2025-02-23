import { arrayify, hexlify } from '@ethersproject/bytes'
import BigNumber from 'bignumber.js'
import StarMaskOnboarding from '@starcoin/starmask-onboarding'
import { providers, utils, bcs, encoding, version as starcoinVersion } from '@starcoin/starcoin'
import { encrypt } from 'eth-sig-util'
import { compare } from 'compare-versions';
import jquery from 'jquery';


let starcoinProvider

const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost'
  ? 'http://localhost:9032'
  : undefined

const { isStarMaskInstalled } = StarMaskOnboarding

// Dapp Status Section
const networkDiv = document.getElementById('network')
const chainIdDiv = document.getElementById('chainId')
const accountsDiv = document.getElementById('accounts')

// Basic Actions Section
const onboardButton = document.getElementById('connectButton')
const getAccountsButton = document.getElementById('getAccounts')
const getAccountsResults = document.getElementById('getAccountsResult')

// Permissions Actions Section
const requestPermissionsButton = document.getElementById('requestPermissions')
const getPermissionsButton = document.getElementById('getPermissions')
const permissionsResult = document.getElementById('permissionsResult')

// Send STC Section
const sendButton = document.getElementById('sendButton')
const callContractButton = document.getElementById('callContractButton')
const contractStatus2 = document.getElementById('contractStatus2')

// Contract Section
const contractPayloadhex = document.getElementById('contractPayloadhex')
const deployButton = document.getElementById('deployButton')
const tokenAddressButton = document.getElementById('tokenAddressButton')
const contractStatus = document.getElementById('contractStatus')

// Call Contract Function
const moduleIdInput = document.getElementById('moduleIdInput')
const resolveResultView = document.getElementById('resolveResultView')
const resolveModuleButton = document.getElementById('resolveModuleButton')
const moduleFunctionsDiv = document.getElementById('moduleFunctionsDiv')
const moduleFunctionTemplate = document.getElementById('moduleFunctionTemplate')
const moduleFunctionTyArgTemplate = document.getElementById('moduleFunctionTyArgTemplate')
const moduleFunctionArgTemplate = document.getElementById('moduleFunctionArgTemplate')
const moduleFunctionExecuteBtnTemplate = document.getElementById('moduleFunctionExecuteBtnTemplate')
const moduleFunctionCallBtnTemplate = document.getElementById('moduleFunctionCallBtnTemplate')

// Signature Section
const personalSign = document.getElementById('personalSign')
const personalSignResult = document.getElementById('personalSignResult')
const personalSignVerify = document.getElementById('personalSignVerify')
const personalSignRecoverResult = document.getElementById('personalSignRecoverResult')

// Encrypt / Decrypt Section
const getEncryptionKeyButton = document.getElementById('getEncryptionKeyButton')
const encryptMessageInput = document.getElementById('encryptMessageInput')
const encryptButton = document.getElementById('encryptButton')
const decryptButton = document.getElementById('decryptButton')
const encryptionKeyDisplay = document.getElementById('encryptionKeyDisplay')
const ciphertextDisplay = document.getElementById('ciphertextDisplay')
const cleartextDisplay = document.getElementById('cleartextDisplay')

// Cross Chain
const crossChainLockWithSTC = document.getElementById('crossChainLockWithSTC')
const crossChainGetLockTreasury = document.getElementById('crossChainGetLockTreasury')
const crossChainResult = document.getElementById('crossChainResult')

// Airdrop Section
const claimAirdrop = document.getElementById('claimAirdrop')
const checkClaimedAirdrop = document.getElementById('checkClaimedAirdrop')
const claimAirdropResult = document.getElementById('claimAirdropResult')

// NFT Section
const mintWithImage = document.getElementById('mintWithImage')
const mintWithImageData = document.getElementById('mintWithImageData')
const nftResult = document.getElementById('nftResult')
const isAcceptNFT = document.getElementById('isAcceptNFT')
const acceptNFT = document.getElementById('acceptNFT')
const transferNFT = document.getElementById('transferNFT')

// AutoAcceptToken Section
const isAutoAcceptToken = document.getElementById('isAutoAcceptToken')
const autoAcceptTokenOn = document.getElementById('autoAcceptTokenOn')
const autoAcceptTokenOff = document.getElementById('autoAcceptTokenOff')
const autoAcceptTokenResult = document.getElementById('autoAcceptTokenResult')

const airdropRecords = [
  {
    airDropId: 1629220858501,
    ownerAddress: '0x3f19d5422824f47e6c021978cee98f35',
    root: '0xaacff971f163f956a24068dc5f50e03313e374a1725a8806ff275441f9aa6109',
    address: '0x3f19d5422824f47e6c021978cee98f35',
    idx: 0,
    amount: 1000000000,
    proof: [
      '0xac47a36f0bc7f19afd2baba9c8182e7e8d6dbe2a3eff03f9519fd4b50e6f1960'
    ]
  },
  {
    airDropId: 1629220858501,
    ownerAddress: '0x3f19d5422824f47e6c021978cee98f35',
    root: '0xaacff971f163f956a24068dc5f50e03313e374a1725a8806ff275441f9aa6109',
    address: '0xd7f20befd34b9f1ab8aeae98b82a5a51',
    idx: 1,
    amount: 1000000000,
    proof: [
      '0xa9851fbee8dc895269b4a503d141460d6e6b07919d8cf37d0225d06caa8bc5fd'
    ]
  }
]

const airdropFunctionIdMap = {
  '1': '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script', // main
  '2': '', // proxima
  '251': '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script', // barnard
  '253': '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script', // halley
  '254': '', // localhost
}

const nodeUrlMap = {
  '1': 'https://main-seed.starcoin.org',
  '2': 'https://proxima-seed.starcoin.org',
  '251': 'https://barnard-seed.starcoin.org',
  '253': 'https://halley-seed.starcoin.org',
  '254': 'http://localhost:9850',
}

const nft = {
  name: 'my_test_nft',
  imageUrl: 'ipfs:://QmSPcvcXgdtHHiVTAAarzTeubk5X3iWymPAoKBfiRFjPMY',
  imageData: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6Y2M9Imh0dHA6Ly93ZWIucmVzb3VyY2Uub3JnL2NjLyIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB3aWR0aD0iMTUwcHgiIGhlaWdodD0iMTUwcHgiIHZpZXdCb3g9IjAgMCAxNTAgMTUwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiBpZD0ic3ZnX2RvY3VtZW50IiBzdHlsZT0iem9vbTogMTsiPjwhLS0gQ3JlYXRlZCB3aXRoIG1hY1NWRyAtIGh0dHBzOi8vbWFjc3ZnLm9yZy8gLSBodHRwczovL2dpdGh1Yi5jb20vZHN3YXJkMi9tYWNzdmcvIC0tPjx0aXRsZSBpZD0ic3ZnX2RvY3VtZW50X3RpdGxlIj5VbnRpdGxlZC5zdmc8L3RpdGxlPjxkZWZzIGlkPSJzdmdfZG9jdW1lbnRfZGVmcyI+PC9kZWZzPjxnIGlkPSJtYWluX2dyb3VwIj48cmVjdCBpZD0iYmFja2dyb3VuZF9yZWN0IiBmaWxsPSIjMTU4OGYxIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE1MHB4IiBoZWlnaHQ9IjE1MHB4Ij48L3JlY3Q+PC9nPjwvc3ZnPg==',
  description: 'my_test_nft description',
}

const initialize = async () => {
  console.log('initialize')
  try {
    if (window.starcoin) {
      // We must specify the network as 'any' for starcoin to allow network changes
      starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
      const blocknumber = await starcoinProvider.getBlockNumber()
      console.log({ blocknumber })
    }
  } catch (error) {
    console.error(error)
  }

  let onboarding
  try {
    onboarding = new StarMaskOnboarding({ forwarderOrigin })
  } catch (error) {
    console.error(error)
  }

  let accounts
  let accountButtonsInitialized = false

  const accountButtons = [
    getAccountsButton,
    requestPermissionsButton,
    getPermissionsButton,
    sendButton,
    callContractButton,
    deployButton,
    tokenAddressButton,
    personalSign,
    personalSignVerify,
    getEncryptionKeyButton,
    encryptMessageInput,
    encryptButton,
    decryptButton,
    claimAirdrop,
    checkClaimedAirdrop,
    crossChainLockWithSTC,
    crossChainGetLockTreasury,
    mintWithImage,
    mintWithImageData,
    isAcceptNFT,
    acceptNFT,
    transferNFT,
    isAutoAcceptToken,
    autoAcceptTokenOn,
    autoAcceptTokenOff,
  ]

  const isStarMaskConnected = () => accounts && accounts.length > 0

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    onboarding.startOnboarding()
  }

  const onClickConnect = async () => {
    try {
      const newAccounts = await window.starcoin.request({
        method: 'stc_requestAccounts',
      })
      handleNewAccounts(newAccounts)
    } catch (error) {
      console.error(error)
    }
  }

  const clearTextDisplays = () => {
    // encryptionKeyDisplay.innerText = ''
    // encryptMessageInput.value = ''
    // ciphertextDisplay.innerText = ''
    // cleartextDisplay.innerText = ''
  }

  const updateButtons = () => {
    const accountButtonsDisabled = !isStarMaskInstalled() || !isStarMaskConnected()
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true
      }
      clearTextDisplays()
    } else {
      getAccountsButton.disabled = false
      requestPermissionsButton.disabled = false
      getPermissionsButton.disabled = false
      sendButton.disabled = false
      callContractButton.disabled = false
      deployButton.disabled = false
      personalSign.disabled = false
      getEncryptionKeyButton.disabled = false
      claimAirdrop.disabled = false
      checkClaimedAirdrop.disabled = false
      mintWithImage.disabled = false
      crossChainLockWithSTC.disabled = false
      crossChainGetLockTreasury.disabled = false
      mintWithImageData.disabled = false
      isAcceptNFT.disabled = false
      acceptNFT.disabled = false
      transferNFT.disabled = false
      isAutoAcceptToken.disabled = false
      autoAcceptTokenOn.disabled = false
      autoAcceptTokenOff.disabled = false
    }

    if (!isStarMaskInstalled()) {
      onboardButton.innerText = 'Click here to install StarMask!'
      onboardButton.onclick = onClickInstall
      onboardButton.disabled = false
    } else if (isStarMaskConnected()) {
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
      if (onboarding) {
        onboarding.stopOnboarding()
      }
    } else {
      onboardButton.innerText = 'Connect'
      onboardButton.onclick = onClickConnect
      onboardButton.disabled = false
    }
  }

  const initializeAccountButtons = () => {

    if (accountButtonsInitialized) {
      return
    }
    accountButtonsInitialized = true

    getAccountsButton.onclick = async () => {
      try {
        const _accounts = await window.starcoin.request({
          method: 'stc_accounts',
        })
        getAccountsResults.innerHTML = _accounts[0] || 'Not able to get accounts'
      } catch (err) {
        console.error(err)
        getAccountsResults.innerHTML = `Error: ${ err.message }`
      }
    }

    /**
     * Permissions
     */

    requestPermissionsButton.onclick = async () => {
      try {
        permissionsResult.innerHTML = ''
        const permissionsArray = await window.starcoin.request({
          method: 'wallet_requestPermissions',
          params: [{ stc_accounts: {} }],
        })
        permissionsResult.innerHTML = getPermissionsDisplayString(permissionsArray)
      } catch (err) {
        console.error(err)
        permissionsResult.innerHTML = `Error: ${ err.message }`
      }
    }

    getPermissionsButton.onclick = async () => {
      try {
        permissionsResult.innerHTML = ''
        const permissionsArray = await window.starcoin.request({
          method: 'wallet_getPermissions',
        })
        permissionsResult.innerHTML = getPermissionsDisplayString(permissionsArray)
      } catch (err) {
        console.error(err)
        permissionsResult.innerHTML = `Error: ${ err.message }`
      }
    }

    /**
     * Sending STC
     */

    sendButton.onclick = async () => {
      console.log('sendButton.onclick')

      const toAccount = document.getElementById('toAccountInput').value
      if (!toAccount) {
        // eslint-disable-next-line no-alert
        window.alert('Invalid To: can not be empty!')
        return false
      }

      const sendAmount = parseFloat(document.getElementById('amountInput').value, 10)
      if (!(sendAmount > 0)) {
        // eslint-disable-next-line no-alert
        window.alert('Invalid sendAmount: should be a number!')
        return false
      }
      const BIG_NUMBER_NANO_STC_MULTIPLIER = new BigNumber('1000000000')
      const sendAmountSTC = new BigNumber(String(document.getElementById('amountInput').value), 10)
      const sendAmountNanoSTC = sendAmountSTC.times(BIG_NUMBER_NANO_STC_MULTIPLIER)
      const sendAmountHex = `0x${ sendAmountNanoSTC.toString(16) }`
      console.log({ sendAmountHex, sendAmountNanoSTC: sendAmountNanoSTC.toString(10) })

      const txParams = {
        to: toAccount,
        value: sendAmountHex,
        gasLimit: 127845,
        gasPrice: 1,
      }

      const expiredSecs = parseInt(document.getElementById('expiredSecsInput').value, 10)
      console.log({ expiredSecs })
      if (expiredSecs > 0) {
        txParams.expiredSecs = expiredSecs
      }

      console.log({ txParams })
      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      console.log(transactionHash)
    }

    callContractButton.onclick = async () => {
      contractStatus2.innerHTML = 'Calling'
      callContractButton.disabled = true
      try {
        const functionId = '0x1::TransferScripts::peer_to_peer_v2'
        const strTypeArgs = ['0x1::STC::STC']
        const tyArgs = utils.tx.encodeStructTypeTags(strTypeArgs)

        const toAccount = document.getElementById('toAccountInput').value
        if (!toAccount) {
          // eslint-disable-next-line no-alert
          window.alert('Invalid To: can not be empty!')
          return false
        }
        console.log({ toAccount })

        const sendAmount = parseFloat(document.getElementById('amountInput').value, 10)
        if (!(sendAmount > 0)) {
          // eslint-disable-next-line no-alert
          window.alert('Invalid sendAmount: should be a number!')
          return false
        }
        const BIG_NUMBER_NANO_STC_MULTIPLIER = new BigNumber('1000000000')
        const sendAmountSTC = new BigNumber(String(document.getElementById('amountInput').value), 10)
        const sendAmountNanoSTC = sendAmountSTC.times(BIG_NUMBER_NANO_STC_MULTIPLIER)
        const sendAmountHex = `0x${ sendAmountNanoSTC.toString(16) }`

        // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
        const amountSCSHex = (function () {
          const se = new bcs.BcsSerializer()
          // eslint-disable-next-line no-undef
          se.serializeU128(BigInt(sendAmountNanoSTC.toString(10)))
          return hexlify(se.getBytes())
        })()
        console.log({ sendAmountHex, sendAmountNanoSTC: sendAmountNanoSTC.toString(10), amountSCSHex })

        const args = [
          arrayify(toAccount),
          arrayify(amountSCSHex),
        ]

        const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, args)
        console.log(scriptFunction)

        // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
        const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return hexlify(se.getBytes())
        })()
        console.log({ payloadInHex })

        const txParams = {
          data: payloadInHex,
        }

        const expiredSecs = parseInt(document.getElementById('expiredSecsInput').value, 10)
        console.log({ expiredSecs })
        if (expiredSecs > 0) {
          txParams.expiredSecs = expiredSecs
        }

        console.log({ txParams })
        const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
        console.log({ transactionHash })
      } catch (error) {
        contractStatus2.innerHTML = 'Call Failed'
        callContractButton.disabled = false
        throw error
      }
      contractStatus2.innerHTML = 'Call Completed'
      callContractButton.disabled = false
    }

    /**
     * Contract Interactions
     */

    deployButton.onclick = async () => {
      let transactionHash
      contractStatus.innerHTML = 'Deploying'

      try {
        const packageHex = contractPayloadhex.value.trim()
        if (!packageHex.length) {
          alert('Contract blob hex is empty')
        }
        const transactionPayloadHex = encoding.packageHexToTransactionPayloadHex(packageHex)
        transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction({
          data: transactionPayloadHex,
        })
        console.log({ transactionHash })
      } catch (error) {
        contractStatus.innerHTML = 'Deployment Failed'
        throw error
      }

      console.log(`Contract deployed! address: ${ accounts[0] } transactionHash: ${ transactionHash }`)
      contractStatus.innerHTML = 'Deployed'
      tokenAddressButton.disabled = false
      // console.log(contract)
    }

    tokenAddressButton.onclick = async () => {
      contractStatus.innerHTML = 'contract method request started'
      try {
        const result = await starcoinProvider.call({
          function_id: `${ accounts[0] }::ABC::token_address`,
          type_args: [],
          args: [],
        })
        contractStatus.innerHTML = result[0]
      } catch (error) {
        console.log(error)
        throw error
      }
    }

    /**
     * Register click event for Resolve functions
     */
    resolveModuleButton.onclick = async () => {
      const container = jquery(moduleFunctionsDiv)
      const resultView = jquery(resolveResultView).show()

      container.empty();

      resolveFunctions(container, function(err, result){
        if (err!= null) {
          resultView.find(".tips").html('Resolve functions failed, error: ' + err)
          return
        }

        if (result != null) {
          resultView.hide()
        } else {
          resultView.find(".tips").html('Not found functions!')
        }
      })

      return false
    }

    /**
     * Resolve functions
     */
    let resolveFunctions = async (container, cb) => {
      let moduleId = null
      let functionId = moduleIdInput.value

      let tokens = functionId.split("::")
      if (tokens.length >= 3) {
        moduleId = tokens[0] + "::" + tokens[1]
      } else {
        moduleId = functionId
        functionId = null
      }

      console.log("moduleId: " + moduleId)
      console.log("functionId: " + functionId)

      try {
        let script_functions = null

        if (functionId === null) {
          // resolve module functions
          const moduleInfo = await window.starcoin.request({
            method: 'contract.resolve_module',
            params: [moduleId],
          }).catch(err => {
            cb && cb(err)
          });

          console.log("moduleInfo: ")
          console.log(moduleInfo)

          script_functions = moduleInfo.script_functions
        } else {
          // resolve single function
          const functionoInfo = await window.starcoin.request({
            method: 'contract.resolve_function',
            params: [functionId],
          }).catch(err => {
            cb && cb(err)
          });

          console.log("functionoInfo: ")
          console.log(functionoInfo)

          script_functions = [functionoInfo]
        }

        const funcTpl = jquery(moduleFunctionTemplate).children()
        const tyArgTpl = jquery(moduleFunctionTyArgTemplate).children()
        const argTpl = jquery(moduleFunctionArgTemplate).children()
        const executeBtnTpl = jquery(moduleFunctionExecuteBtnTemplate).children()
        const callBtnTpl = jquery(moduleFunctionCallBtnTemplate).children()

        if (script_functions && script_functions.length>0) {
            for (var i=0; i<script_functions.length; i++) {
              const func =  script_functions[i]
              const funcView = funcTpl.clone().show()
              funcView.find(".func-name").text(func.name)

              const argsContainer = funcView.find(".moduleFunctionArgsForm")
              const funcResultView = funcView.find(".funcResult")

              // TyArgs
              const tyArgs = func.ty_args
              const tyArgsBody = argsContainer.find(".ty_args")

              for (var j=0; j<tyArgs.length; j++) {
                const arg = tyArgs[j]
                const argView = tyArgTpl.clone().show()
                argView.find(".tyarg-name").text(arg.name)
                argView.find(".tyarg-val").attr("placeholder", arg.type_tag)
                tyArgsBody.append(argView)
              }

              // Args
              const args = func.args
              const argsBody = argsContainer.find(".args")

              for (var j=0; j<args.length; j++) {
                const arg = args[j]
                const argView = argTpl.clone().show()
                
                argView.find(".arg-name").text(arg.name)
                argView.find(".arg-val").attr("placeholder", typeTagToText(arg.type_tag))
                
                argsBody.append(argView)
              }

              // Buttons
              if (args.length>0 && args[0].type_tag=="Signer") {
                // disable p0 signer
                argsContainer.find(".arg-val").first().attr("disabled","true")

                // append execute button
                let executeBtn = executeBtnTpl.clone().show()
                bindEventForExecuteBtn(argsContainer, executeBtn, funcResultView, moduleId, func.name)
                argsContainer.append(executeBtn)
              } else {
                let callBtn = callBtnTpl.clone().show()
                bindEventForCallBtn(argsContainer, callBtn, funcResultView, moduleId, func.name)
                argsContainer.append(callBtn)
              }

              container.append(funcView);
            }

            cb && cb(null, container)
        } else {
          cb && cb(null, null)
        }
      } catch (err) {
        cb && cb(err)
      }
    }

    /**
     * type tag to text
     */
    let typeTagToText = function(type_tag) {
      if (typeof(type_tag)=='string') {
        return type_tag
      }

      let keys = Object.keys(type_tag)
      if (keys.length >0) {
        let key = keys[0]
        return key + "<" + typeTagToText(type_tag[key]) + ">"
      } else {
        return ""
      }
    }

    /**
     * bind click event for execute button
     */
    let bindEventForExecuteBtn = function(argsContainer, executeBtn, resultView, moduleId, functionName) {
      executeBtn.on("click", async () => {
        let tyArgs = toTyArgs(argsContainer.find(".tyarg-val"))
        let args = toArgs(argsContainer.find(".arg-val"))

        resultView.html('Calling ' + functionName)

        callFunctionWithSign(moduleId, functionName, tyArgs, args, function(err, result){
          if (err!= null) {
            resultView.html('Call ' + functionName + ' failed, error: ' + err)
            return
          }

          if (result != null) {
            resultView.html('Call ' + functionName + ' completed, transactionHash: ' + result)
          } else {
            resultView.html('Call ' + functionName + ' completed.')
          }
        })

        return false
      })
    }

    /**
     * bind click event for call button
     */
    let bindEventForCallBtn = function(argsContainer, callBtn, resultView, moduleId, functionName) {
      callBtn.on("click", async () => {
        let tyArgs = toTyArgs(argsContainer.find(".tyarg-val"))
        let args = toJsonArgs(argsContainer.find(".arg-val"))
        
        resultView.html('Calling ' + functionName)

        callFunction(moduleId, functionName, tyArgs, args, function(err, result){
          if (err!= null) {
            resultView.html('Call ' + functionName + ' failed, error: ' + err)
            return
          }

          if (result != null) {
            resultView.html('Call ' + functionName + ' completed, result: ' + result)
          } else {
            resultView.html('Call ' + functionName + ' completed.')
          }
        })

        return false
      })
    }

    let toTyArgs = function(inputEles) {
      let tyArgs = []
      inputEles.each(function(){
        tyArgs.push(jquery(this).val())
      })
      return tyArgs
    }

    let toArgs = function(inputEles) {
      let argTypes = []
      let args = []

      inputEles.each(function(){
        let argEle = jquery(this)
        let argType = argEle.attr("placeholder").toLowerCase()
        let argVal = argEle.val()

        argTypes.push(argType)

        // Move has few built-in primitive types to represent numbers, 
        // addresses and boolean values: integers (u8, u64, u128), boolean and address
        if (argType.startsWith("u")) {
          let val = parseInt(argVal) 
          args.push(val)
        } else if (argType == "bool") {
          let val = JSON.parse(argVal)
          args.push(val)
        } else {
          args.push(argVal)
        }
      })

      // Remove the first Signer type
      if (argTypes[0] === 'signer') {
        argTypes.shift();
        args.shift()
      }

      return args
    }

    let toJsonArgs = function(inputEles) {
      let argTypes = []
      let args = []

      inputEles.each(function(){
        let argEle = jquery(this)
        let argType = argEle.attr("placeholder").toLowerCase()
        let argVal = argEle.val()

        argTypes.push(argType)

        // Move has few built-in primitive types to represent numbers, 
        // addresses and boolean values: integers (u8, u64, u128), boolean and address
        if (argType.startsWith("u")) {
          if (argType == "u8") {
            let val = parseInt(argVal) 
            args.push(val)
          } else {
            args.push(`${argVal}${argType}`)
          }
        } else if (argType == "bool") {
          let val = JSON.parse(argVal)
          args.push(val)
        } else if (argType == "vector<u8>") {
          args.push(`x"${argVal}"`)
        } else {
          args.push(argVal)
        }
      })

      // Remove the first Signer type
      if (argTypes[0] === 'signer') {
        argTypes.shift();
        args.shift()
      }

      return args
    }

    /**
     * Call function with sign
     */
    let callFunctionWithSign = async (moduleId, functionName, tyArgs, args, cb) => {
      const functionId = moduleId + "::" + functionName

      try {
        const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
        console.log({ functionId, tyArgs, args, nodeUrl })

        const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

        const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return hexlify(se.getBytes())
        })()
        console.log({ payloadInHex })

        const txParams = {
          data: payloadInHex,
        }

        const transactionHash = await starcoinProvider.getSigner()
          .sendUncheckedTransaction(txParams)
          .catch(err => {
            cb && cb(err)
          });
        
        console.log({ transactionHash })
        cb && cb(null, transactionHash)
      } catch (err) {
        cb && cb(err)
      }
    }

    /**
     * Call function
     */
    let callFunction = async (moduleId, functionName, tyArgs, args, cb) => {
      const functionId = moduleId + "::" + functionName

      try {
        console.log({ functionId, tyArgs, args})

        const result = await new Promise((resolve, reject) => {
          return starcoinProvider.send(
            'contract.call_v2',
            [
              {
                function_id: functionId,
                type_args: tyArgs,
                args,
              },
            ],
          ).then((result) => {
            if (result && Array.isArray(result) && result.length) {
              resolve(result[0])
            } else {
              reject(new Error('fetch failed'))
            }
          }).catch(err => {
            cb && cb(err.message)
          });
        });

        cb && cb(null, result)
      } catch (err) {
        cb && cb(err.message)
      }
    }

    /**
     * Personal Sign
     */
    personalSign.onclick = async () => {
      const exampleMessage = 'Example `personal_sign` message 中文'
      try {
        personalSignResult.innerHTML = ''
        personalSignVerify.disabled = false
        personalSignRecoverResult.innerHTML = ''
        const from = accounts[0]
        const msg = `0x${ Buffer.from(exampleMessage, 'utf8').toString('hex') }`
        console.log({ msg })
        const networkId = networkDiv.innerHTML
        const extraParams = { networkId }
        const sign = await window.starcoin.request({
          method: 'personal_sign',
          // params: [msg, from, 'Example password'],
          // extraParams = params[2] || {}; means it should be an object:
          // params: [msg, from, { pwd: 'Example password' }],
          params: [msg, from, extraParams],
        })
        personalSignResult.innerHTML = sign
      } catch (err) {
        console.error(err)
        personalSign.innerHTML = `Error: ${ err.message }`
      }
    }

    /**
     * Personal Sign Verify
     */
    personalSignVerify.onclick = async () => {
      try {
        const from = accounts[0]
        const sign = personalSignResult.innerHTML
        const recoveredAddr = await utils.signedMessage.recoverSignedMessageAddress(sign)
        console.log({ recoveredAddr })

        if (recoveredAddr === from) {
          console.log(`@starcoin/starcoin Successfully verified signer as ${ recoveredAddr }`)
          personalSignRecoverResult.innerHTML = recoveredAddr
        } else {
          console.log('@starcoin/starcoin Failed to verify signer')
        }
      } catch (err) {
        console.error(err)
        personalSignRecoverResult.innerHTML = `Error: ${ err.message }`
      }
    }

    /**
     * Encrypt / Decrypt
     */

    getEncryptionKeyButton.onclick = async () => {
      try {
        const publicKey = await window.starcoin.request({
          method: 'stc_getEncryptionPublicKey',
          params: [accounts[0]],
        })
        encryptionKeyDisplay.innerText = publicKey
        encryptMessageInput.disabled = false
      } catch (error) {
        encryptionKeyDisplay.innerText = `Error: ${ error.message }`
        encryptMessageInput.disabled = true
        encryptButton.disabled = true
        decryptButton.disabled = true
      }
    }

    encryptMessageInput.onkeyup = () => {
      if (
        !getEncryptionKeyButton.disabled &&
        encryptMessageInput.value.length > 0
      ) {
        if (encryptButton.disabled) {
          encryptButton.disabled = false
        }
      } else if (!encryptButton.disabled) {
        encryptButton.disabled = true
      }
    }

    encryptButton.onclick = () => {
      try {
        const ecrryptResult = encrypt(
          encryptionKeyDisplay.innerText,
          { 'data': encryptMessageInput.value },
          'x25519-xsalsa20-poly1305',
        )
        ciphertextDisplay.innerText = stringifiableToHex(ecrryptResult)
        decryptButton.disabled = false
      } catch (error) {
        ciphertextDisplay.innerText = `Error: ${ error.message }`
        decryptButton.disabled = true
      }
    }

    decryptButton.onclick = async () => {
      try {
        cleartextDisplay.innerText = await window.starcoin.request({
          method: 'stc_decrypt',
          params: [ciphertextDisplay.innerText, window.starcoin.selectedAddress],
        })
      } catch (error) {
        cleartextDisplay.innerText = `Error: ${ error.message }`
      }
    }

    /**
     * Cross Chain Lock with STC
     */
    crossChainLockWithSTC.onclick = async () => {
      crossChainResult.innerHTML = 'Calling LockWithSTC'
      crossChainLockWithSTC.disabled = true
      try {
        const functionId = '0x18351d311d32201149a4df2a9fc2db8a::CrossChainScript::lock_with_stc_fee'
        const tyArgs = []
        // const fromAssetHash = "0x00000000000000000000000000000001::STC::STC"
        // const toChainId = 318
        // const toAddress = "0x18351d311d32201149a4df2a9fc2db8a"
        // const amount = 10000000
        // const fee = 5000000
        // const id = 1

        const fromAssetHash = "0x18351d311d32201149a4df2a9fc2db8a::XETH::XETH"
        const toChainId = 2
        const toAddress = "0x208d1ae5bb7fd323ce6386c443473ed660825d46"
        const amount = 115555000000
        const fee = 5000000
        const id = 1

        const fromAssetHashHex = (function () {
          const se = new bcs.BcsSerializer();
          se.serializeStr(fromAssetHash);
          return hexlify(se.getBytes());
        })();

        console.log({ fromAssetHash, fromAssetHashHex })

        const toChainIdHex = (function () {
          const se = new bcs.BcsSerializer();
          se.serializeU64(toChainId);
          return hexlify(se.getBytes());
        })();

        const toAddressHex = (function () {
          const se = new bcs.BcsSerializer();
          se.serializeBytes(arrayify(toAddress));
          return hexlify(se.getBytes());
        })();

        const amountHex = (function () {
          const se = new bcs.BcsSerializer();
          se.serializeU128(amount);
          return hexlify(se.getBytes());
        })();

        const feeHex = (function () {
          const se = new bcs.BcsSerializer();
          se.serializeU128(fee);
          return hexlify(se.getBytes());
        })();

        const idHex = (function () {
          const se = new bcs.BcsSerializer();
          se.serializeU128(id);
          return hexlify(se.getBytes());
        })();
        const args = [
          arrayify(fromAssetHashHex),
          arrayify(toChainIdHex),
          arrayify(toAddressHex),
          arrayify(amountHex),
          arrayify(feeHex),
          arrayify(idHex),
        ];
        console.log({ fromAssetHashHex, args });
        const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, args);


        const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return hexlify(se.getBytes())
        })()
        console.log({ payloadInHex })

        const txParams = {
          data: payloadInHex,
        }

        const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
        console.log({ transactionHash })
        const transactionReceipt = await starcoinProvider.getTransactionInfo(transactionHash);
        console.log({ transactionReceipt })
        crossChainResult.innerHTML = 'Call LockWithSTC Completed'
        crossChainLockWithSTC.disabled = false
      } catch (error) {
        crossChainResult.innerHTML = 'Call LockWithSTC Failed'
        crossChainLockWithSTC.disabled = false
        throw error
      }
    }

    crossChainGetLockTreasury.onclick = async () => {
      crossChainResult.innerHTML = 'Get Lock Treasury'
      crossChainGetLockTreasury.disabled = true
      try {
        const functionId = 'contract.get_resource'
        const address = '0x18351d311d32201149a4df2a9fc2db8a'
        const token = '0x18351d311d32201149a4df2a9fc2db8a::XETH::XETH'
        const result = await new Promise((resolve, reject) => {
          return starcoinProvider.send(
            functionId,
            [
              address,
              `0x18351d311d32201149a4df2a9fc2db8a::LockProxy::LockTreasury<${ token }>`,
            ],
          ).then((result) => {
            if (result) {
              resolve(result.value[0][1]['Struct']['value'][0][1]['U128'])
            } else {
              reject(new Error('fetch failed'))
            }

          })
        });
        crossChainResult.innerHTML = result
        crossChainGetLockTreasury.disabled = false
      } catch (error) {
        crossChainResult.innerHTML = JSON.stringify(error)
        crossChainGetLockTreasury.disabled = false
        throw error
      }
    }

    /**
     * Claim Airdrop
     */
    claimAirdrop.onclick = async () => {
      claimAirdropResult.innerHTML = 'Calling'
      claimAirdrop.disabled = true
      try {
        const filterResluts = airdropRecords.filter((record) => record.address.toLowerCase() === accountsDiv.innerHTML.toLowerCase());
        if (filterResluts[0]) {
          const record = filterResluts[0]

          const functionId = airdropFunctionIdMap[window.starcoin.networkVersion]
          if (!module) {
            window.alert('airdrop contract is not deployed on this network!')
            claimAirdropResult.innerHTML = 'Call Failed'
            claimAirdrop.disabled = false
            return false;
          }
          const tyArgs = ['0x00000000000000000000000000000001::STC::STC']
          const args = [record.ownerAddress, record.airDropId, record.root, record.idx, record.amount, record.proof]

          const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
          // console.log({ functionId, tyArgs, args, nodeUrl })

          const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

          // // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
          const payloadInHex = (function () {
            const se = new bcs.BcsSerializer()
            scriptFunction.serialize(se)
            return hexlify(se.getBytes())
          })()
          // console.log({ payloadInHex })

          const txParams = {
            data: payloadInHex,
          }

          const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
          console.log({ transactionHash })
        }
      } catch (error) {
        claimAirdropResult.innerHTML = 'Call Failed'
        claimAirdrop.disabled = false
        throw error
      }
      claimAirdropResult.innerHTML = 'Call Completed'
      claimAirdrop.disabled = false
    }

    /**
     * Check is Claimed
     */
    checkClaimedAirdrop.onclick = async () => {
      claimAirdropResult.innerHTML = 'Calling'
      checkClaimedAirdrop.disabled = true
      try {
        const filterResluts = airdropRecords.filter((record) => record.address.toLowerCase() === accountsDiv.innerHTML.toLowerCase());
        if (filterResluts[0]) {
          const record = filterResluts[0]
          const functionId = '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributor2::is_claimd'
          const tyArgs = ['0x00000000000000000000000000000001::STC::STC']
          const args = [record.ownerAddress, `${ record.airDropId }`, `x"${ record.root.slice(2) }"`, `${ record.idx }u64`]
          console.log(args)
          const isClaimed = await new Promise((resolve, reject) => {
            return starcoinProvider.send(
              'contract.call_v2',
              [
                {
                  function_id: functionId,
                  type_args: tyArgs,
                  args,
                },
              ],
            ).then((result) => {
              if (result && Array.isArray(result) && result.length) {
                resolve(result[0])
              } else {
                reject(new Error('fetch failed'))
              }

            })
          });
          claimAirdropResult.innerHTML = `Claimed is ${ isClaimed }`
          checkClaimedAirdrop.disabled = false
        }
      } catch (error) {
        claimAirdropResult.innerHTML = 'Call Failed'
        checkClaimedAirdrop.disabled = false
        throw error
      }
    }
  }

  /**
   * mint With Image
   */
  mintWithImage.onclick = async () => {
    nftResult.innerHTML = 'Calling mintWithImage'
    mintWithImage.disabled = true
    try {
      const functionId = '0x2c5bd5fb513108d4557107e09c51656c::SimpleNFTScripts::mint_with_image'
      const tyArgs = []
      const args = [nft.name, nft.imageUrl, nft.description]

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log({ functionId, tyArgs, args, nodeUrl })

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

      const payloadInHex = (function () {
        const se = new bcs.BcsSerializer()
        scriptFunction.serialize(se)
        return hexlify(se.getBytes())
      })()
      console.log({ payloadInHex })

      const txParams = {
        data: payloadInHex,
      }

      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      console.log({ transactionHash })
      nftResult.innerHTML = 'Call mintWithImage Completed'
      mintWithImage.disabled = false
    } catch (error) {
      nftResult.innerHTML = 'Call mintWithImage Failed'
      mintWithImage.disabled = false
      throw error
    }
  }

  /**
   * mint With Image Data
   */
  mintWithImageData.onclick = async () => {
    nftResult.innerHTML = 'Calling mintWithImageData'
    mintWithImageData.disabled = true
    try {
      const functionId = '0x2c5bd5fb513108d4557107e09c51656c::SimpleNFTScripts::mint_with_image_data'
      const tyArgs = []
      const args = [nft.name, nft.imageData, nft.description]

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log({ functionId, tyArgs, args, nodeUrl })

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

      const payloadInHex = (function () {
        const se = new bcs.BcsSerializer()
        scriptFunction.serialize(se)
        return hexlify(se.getBytes())
      })()
      console.log({ payloadInHex })

      const txParams = {
        data: payloadInHex,
      }

      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      console.log({ transactionHash })
      nftResult.innerHTML = 'Call mintWithImageData Completed'
      mintWithImageData.disabled = false
    } catch (error) {
      nftResult.innerHTML = 'Call mintWithImageData Failed'
      mintWithImageData.disabled = false
      throw error
    }
  }

  /**
   * Check is accept NFT
   */
  isAcceptNFT.onclick = async () => {
    nftResult.innerHTML = 'Calling isAcceptNFT'
    isAcceptNFT.disabled = true
    try {
      const functionId = '0x1::NFTGallery::is_accept'
      const tyArgs = ['0x2c5bd5fb513108d4557107e09c51656c::SimpleNFT::SimpleNFT',
        '0x2c5bd5fb513108d4557107e09c51656c::SimpleNFT::SimpleNFTBody']
      const args = ['0x3f19d5422824f47E6C021978CeE98f35']
      console.log(args)
      const isAccept = await new Promise((resolve, reject) => {
        return starcoinProvider.send(
          'contract.call_v2',
          [
            {
              function_id: functionId,
              type_args: tyArgs,
              args,
            },
          ],
        ).then((result) => {
          if (result && Array.isArray(result) && result.length) {
            resolve(result[0])
          } else {
            reject(new Error('fetch failed'))
          }

        })
      });
      nftResult.innerHTML = `isAcceptNFT is ${ isAccept }`
      isAcceptNFT.disabled = false
    } catch (error) {
      nftResult.innerHTML = 'Call isAcceptNFT Failed'
      isAcceptNFT.disabled = false
      throw error
    }
  }

  /**
   * accept NFT
   */
  acceptNFT.onclick = async () => {
    nftResult.innerHTML = 'Calling acceptNFT'
    acceptNFT.disabled = true
    try {
      const functionId = '0x1::NFTGalleryScripts::accept'
      const tyArgs = ['0x2c5bd5fb513108d4557107e09c51656c::SimpleNFT::SimpleNFT',
        '0x2c5bd5fb513108d4557107e09c51656c::SimpleNFT::SimpleNFTBody']
      const args = []

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log({ functionId, tyArgs, args, nodeUrl })

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

      const payloadInHex = (function () {
        const se = new bcs.BcsSerializer()
        scriptFunction.serialize(se)
        return hexlify(se.getBytes())
      })()
      console.log({ payloadInHex })

      const txParams = {
        data: payloadInHex,
      }

      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      console.log({ transactionHash })
      nftResult.innerHTML = 'Call acceptNFT Completed'
      acceptNFT.disabled = false
    } catch (error) {
      nftResult.innerHTML = 'Call acceptNFT Failed'
      acceptNFT.disabled = false
      throw error
    }
  }

  /**
   * transfer NFT
   */
  transferNFT.onclick = async () => {
    nftResult.innerHTML = 'Calling transferNFT'
    transferNFT.disabled = true
    try {
      const functionId = '0x1::NFTGalleryScripts::transfer'
      const tyArgs = ['0x2c5bd5fb513108d4557107e09c51656c::SimpleNFT::SimpleNFT',
        '0x2c5bd5fb513108d4557107e09c51656c::SimpleNFT::SimpleNFTBody']
      const args = [7, '0xD7f20bEFd34B9f1ab8aeae98b82a5A51']

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log({ functionId, tyArgs, args, nodeUrl })

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

      const payloadInHex = (function () {
        const se = new bcs.BcsSerializer()
        scriptFunction.serialize(se)
        return hexlify(se.getBytes())
      })()
      console.log({ payloadInHex })

      const txParams = {
        data: payloadInHex,
      }

      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      console.log({ transactionHash })
      nftResult.innerHTML = 'Call transferNFT Completed'
      transferNFT.disabled = false
    } catch (error) {
      nftResult.innerHTML = 'Call transferNFT Failed'
      transferNFT.disabled = false
      throw error
    }
  }

  /**
   * AutoAcceptToken
   */
  isAutoAcceptToken.onclick = async () => {
    autoAcceptTokenResult.innerHTML = 'Calling isAutoAcceptToken'
    isAutoAcceptToken.disabled = true

    try {
      const result = await window.starcoin.request({
        method: 'state.get_resource',
        params: [accounts[0], '0x1::Account::AutoAcceptToken'],
      })
      autoAcceptTokenResult.innerHTML = result && result.raw && parseInt(result.raw, 16) ? 'On' : 'Off'
      isAutoAcceptToken.disabled = false
    } catch (error) {
      autoAcceptTokenResult.innerHTML = 'Call isAutoAcceptToken Failed'
      isAutoAcceptToken.disabled = false
      throw error
    }
  }

  autoAcceptTokenOn.onclick = async () => {
    autoAcceptTokenResult.innerHTML = 'Turn On'
    console.log([accounts[0]])
    try {
      const functionId = '0x1::AccountScripts::enable_auto_accept_token'
      const tyArgs = []
      const args = []

      const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, args)

      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function () {
        const se = new bcs.BcsSerializer()
        scriptFunction.serialize(se)
        return hexlify(se.getBytes())
      })()
      console.log({ payloadInHex })

      const txParams = {
        data: payloadInHex,
      }

      // addGasBufferMultiplier is supported since:
      // @starcoin/starcoin >= 1.8.0 and starmask >= 3.3.0
      // so we need to check the version of @starcoin/starcoin before using it in the dapps
      if (compare(starcoinVersion || '1.0.0', '1.8.0', '>=') && document.getElementById('addGasBufferMultiplier').value) {
        const addGasBufferMultiplier = parseFloat(document.getElementById('addGasBufferMultiplier').value, 10) || 1.5
        txParams.addGasBufferMultiplier = addGasBufferMultiplier
      }
      const expiredSecs = parseInt(document.getElementById('expiredSecsInput').value, 10)
      if (expiredSecs > 0) {
        txParams.expiredSecs = expiredSecs
      }

      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      console.log({ transactionHash })
    } catch (error) {
      autoAcceptTokenResult.innerHTML = 'Call Failed'
      throw error
    }
    autoAcceptTokenResult.innerHTML = 'Call Completed'
  }

  autoAcceptTokenOff.onclick = async () => {
    autoAcceptTokenResult.innerHTML = 'Turn Off'
    try {
      const functionId = '0x1::AccountScripts::disable_auto_accept_token'
      const tyArgs = []
      const args = []

      const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, args)

      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function () {
        const se = new bcs.BcsSerializer()
        scriptFunction.serialize(se)
        return hexlify(se.getBytes())
      })()

      const txParams = {
        data: payloadInHex,
      }

      const expiredSecs = parseInt(document.getElementById('expiredSecsInput').value, 10)
      if (expiredSecs > 0) {
        txParams.expiredSecs = expiredSecs
      }

      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      console.log({ transactionHash })
    } catch (error) {
      autoAcceptTokenResult.innerHTML = 'Call Failed'
      throw error
    }
    autoAcceptTokenResult.innerHTML = 'Call Completed'
  }

  function handleNewAccounts(newAccounts) {
    accounts = newAccounts
    accountsDiv.innerHTML = accounts
    if (getAccountsResults.innerHTML) {
      getAccountsResults.innerHTML = accounts
    }
    if (isStarMaskConnected()) {
      initializeAccountButtons()
    }
    updateButtons()
  }

  function handleNewChain(chainId) {
    chainIdDiv.innerHTML = chainId
  }

  function handleNewNetwork(networkId) {
    networkDiv.innerHTML = networkId
  }

  async function getNetworkAndChainId() {
    try {
      const chainInfo = await window.starcoin.request({
        method: 'chain.id',
      })
      handleNewChain(`0x${ chainInfo.id.toString(16) }`)
      handleNewNetwork(chainInfo.id)
    } catch (err) {
      console.error(err)
    }
  }

  updateButtons()

  if (isStarMaskInstalled()) {

    window.starcoin.autoRefreshOnNetworkChange = false
    getNetworkAndChainId()

    try {
      const newAccounts = await window.starcoin.request({
        method: 'stc_accounts',
      })
      handleNewAccounts(newAccounts)
    } catch (err) {
      console.error('Error on init when getting accounts', err)
    }

    window.starcoin.on('chainChanged', handleNewChain)
    window.starcoin.on('networkChanged', handleNewNetwork)
    window.starcoin.on('accountsChanged', handleNewAccounts)
  }
}

window.addEventListener('DOMContentLoaded', initialize)

// utils

function getPermissionsDisplayString(permissionsArray) {
  if (permissionsArray.length === 0) {
    return 'No permissions found.'
  }
  const permissionNames = permissionsArray.map((perm) => perm.parentCapability)
  return permissionNames.reduce((acc, name) => `${ acc }${ name }, `, '').replace(/, $/u, '')
}

function stringifiableToHex(value) {
  return hexlify(Buffer.from(JSON.stringify(value)))
}

