import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 11155111,
      url: process.env.RPC_URL || "",
    }
  }
};

export default config;
