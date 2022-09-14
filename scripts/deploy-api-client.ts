import { ethers } from "hardhat";

async function main() {
  const ApiClient = await ethers.getContractFactory("ApiClient");
  const apiClient = await ApiClient.deploy();

  await apiClient.deployed();

  console.log(`ApiClient deployed to ${lock.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
