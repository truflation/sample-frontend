var accounts
window.addEventListener('load', function () {
  const ethereumButton = document.querySelector('.enableEthereumButton')
  const showAccount = document.querySelector('.showAccount')
  const balanceAddress = document.querySelector('#balance\\:address')
  ethereumButton.addEventListener('click', () => {
    initAccount()
  })

  async function initAccount () {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    showAccount.innerHTML = accounts[0]
    const inflationAddress =
          document.getElementById('inflation:address')
    const apiAddress =
          document.getElementById('api:address')
    if (balanceAddress) { balanceAddress.value = accounts[0] }
    if (inflationAddress) { inflationAddress.value = config.inflationAddress }
    if (apiAddress) { apiAddress.value = config.apiAddress }
    document.querySelector('.showChain').innerHTML =
      window.ethereum.networkVersion
  }

  if (typeof web3 !== 'undefined') {
    console.log('Web3 Detected! ' + window.ethereum.constructor.name)
    web3 = new Web3(window.ethereum)
  } else {
    console.log('No Web3 Detected... using HTTP Provider')
    web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/<APIKEY>'))
  }
})

function getAccount () {
  if (accounts === undefined) {
    throw new Error('No account available - Please connect to wallet')
  }
  return accounts[0]
}

function hexStringToByteArray (hexString) {
  if (hexString.length % 2 !== 0) {
    throw new Error('Must have an even number of hex digits to convert to bytes')
  }
  let numBytes = hexString.length / 2
  let start = 0
  if (hexString.substr(0, 2) === '0x') {
    start = 1
    numBytes = numBytes - 1
  }
  const byteArray = new Uint8Array(numBytes)
  for (let i = start; i < numBytes + start; i++) {
    byteArray[i - start] = parseInt(hexString.substr(i * 2, 2), 16)
  }
  return byteArray
}

function decode (data, web3, abi, multiplier) {
  if (abi === '' || abi === undefined) {
    abi = 'json'
  }
  let retval
  if (abi === 'cbor') {
    console.log('cbor', data)
    const byteArray = hexStringToByteArray(data)
    retval = cbor.decodeFirstSync(byteArray)
  } else if (abi === 'json') {
    console.log(data)
    const byteArray = hexStringToByteArray(data)
    const string = new TextDecoder().decode(byteArray)
    retval = JSON.parse(string)
  } else {
    retval = web3.eth.abi.decodeParameter(abi, data)
  }
  if (multiplier !== '' && multiplier !== undefined) {
    if (Array.isArray(retval)) {
      retval = retval.map((x) => x / parseInt(multiplier))
    } else {
      retval = retval / parseInt(multiplier)
    }
  }
  return retval
}

async function doApiRequest (request, output) {
  try {
    console.log(request)
    if (request === undefined) {
      throw Error('no request')
    }
    console.log(request.address)
    if (!web3.utils.isAddress(request.address)) {
      throw Error('address not valid')
    }
    output.status.innerHTML = "Running ..."
    const account = getAccount()
    const api = new web3.eth.Contract(
      apiAbi, request.address)
    const linkToken = await api.methods.getChainlinkToken().call()
    const tokenContract = new web3.eth.Contract(
      erc20Abi, linkToken
    )
    const requestTxn = api.methods.doRequest(
      request.service ? request.service : '',
      request.data ? request.data : '',
      request.keypath ? request.keypath : '',
      request.abi ? request.abi : '',
      request.multiplier ? request.multiplier : ''
    )
    output.status.innerHTML = 'Transferring LINK...'
    const fee = await api.methods.fee().call()
    const transfer = tokenContract.methods.transfer(
      request.address, fee
    )
    await transfer.send({
      from: account,
      to: request.address
    })
    output.status.innerHTML = 'Sending request ...'
    const txn = await requestTxn.send({
      from: account,
      to: request.address
    })
    const id = txn.events.ChainlinkRequested.returnValues.id
    console.log(id)
    output.status.innerHTML = 'Waiting for response for request id: ' + id

    api.events.ChainlinkFulfilled(
      {
        filter: { id }
      },
      (error, event) => { console.log('foo', error, event) })
      .on('data', async (event) => {
        const obj = decode(
          await api.methods.results(id).call(),
          web3, request.abi, request.multiplier
        )
        output.output.innerHTML =
          JSON.stringify(obj)
        output.status.innerHTML = ''
      })
  } catch (err) {
    let string = err.toString()
    if (string === "[object Object]") {
      string = JSON.stringify(err)
    }
    output.status.innerHTML = string
    output.output.innerHTML = ''
  }
}
