These are sample web3 apps from [truflation](http://truflation.com)
using [chainlink](http://chain.link)

## Sample apps

* ***[Basic web3 app](https://truflation.github.io/sample-frontend/)***
contains simple code that will allow you to query a smart contract
that provides the current year-on-year truflation index.

* ***[API Tester](https://truflation.github.io/sample-frontend/power-tools.html)*** allows you to send data via the truflation API.

The sample apps connect to the truflation API through a solidity smart
contract [ApiClient](https://remix.ethereum.org/#url=https://raw.githubusercontent.com/truflation/sample-frontend/main/ApiClient.sol) 
which can be connected to the [Truflation API endpoints](https://github.com/truflation/quickstart/blob/main/network.md)

## Getting help

To get help see the [truflation developer discord](https://discord.com/channels/967280164071407666/968071680360587264)

## Running locally

yarn install
yarn serve

go to http://localhost:9011
