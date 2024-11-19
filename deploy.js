// Importing Hardhat's ethers.js library
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const Identity = await ethers.getContractFactory("Identity");
  
  // Deploy the contract
  const identity = await Identity.deploy();
  
  // Wait for the contract to be deployed
  await identity.deployed();
  
  console.log("Identity contract deployed to:", identity.address);
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

