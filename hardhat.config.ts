import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  networks: {
    sepolia: {
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 11155111,
      url: process.env.RPC_URL || "",
      verify: {
        etherscan: {
          apiUrl: 'https://api-sepolia.etherscan.io/',
          apiKey: process.env.API_KEY || ""
        }
      }
    },
    mainnet: {
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 1,
      url: process.env.RPC_URL || "",
      verify: {
        etherscan: {
          apiUrl: 'https://api.etherscan.io/',
          apiKey: process.env.API_KEY || ""
        }
      },
    }
  }
};

export default config;
