import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { ethers } from "hardhat";

module.exports = async ({getNamedAccounts, deployments} : HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const epic = "0xF77B59a2Fd8eA0dED3eE72A2942C298De8A3e802";
    const genesis = "0x20B3773Dba6986bC180fd89766adBA97850165d9";

    await deploy("Bridge", {
      contract: "Bridge",
      from: deployer,
      log: true,
      deterministicDeployment: false,
      proxy: {
        proxyContract: "OptimizedTransparentProxy",
        execute: {
          methodName: "initialize",
          args: [
            epic,
            usdc,
            genesis
          ],
        },
      },
    });

    const bridge = await hre.ethers.getContract("Bridge");
    console.log("Bridge deployed to:", bridge.address);
}

module.exports.tags = ['deploy-mainnet'];