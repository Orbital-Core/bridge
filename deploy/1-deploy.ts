import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import hre from "hardhat";
import { ethers } from "hardhat";

module.exports = async ({getNamedAccounts, deployments} : HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy('Token', {
      from : deployer,
      args: [
        "Orbital", "EPIC"
      ]
    });

    const token = await hre.ethers.getContract("Token");

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
            token.address,
            deployer
          ],
        },
      },
    });

    const mintAmount = ethers.utils.parseEther('10000000')
    const tx = await token.mint(mintAmount) //10 million
    tx.wait(1);
    console.log(tx)

    const bridge = await hre.ethers.getContract("Bridge");

    console.log("Bridge deployed to:", bridge.address);
    console.log("EPIC token deployed to:", token.address);
}

module.exports.tags = ['deploy'];