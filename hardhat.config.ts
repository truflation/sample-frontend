import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
	version: "0.8.17"
      },
      {
	version: "0.7.6"
      }
    ]
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY!
    }
  }
};

export default config;
