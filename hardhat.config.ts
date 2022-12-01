import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const privateKey: string | undefined = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}

const rpcURL: string | undefined = process.env.RPC_URL;
if (!rpcURL) {
  throw new Error("Please set your RPC_URL in a .env file");
}

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
    }
  }
};

export default config;
