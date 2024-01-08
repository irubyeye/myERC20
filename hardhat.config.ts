require("dotenv").config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const INFURA_API_KEY: string = process.env.INFURA_API_KEY || "";

const SEPOLIA_PRIVATE_KEY: string = process.env.SEPOLIA_PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.23",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
