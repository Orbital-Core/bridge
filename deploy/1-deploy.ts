import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { ethers } from "hardhat";

module.exports = async ({getNamedAccounts, deployments} : HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy('EPIC', {
      contract: "Token",
      from : deployer,
      args: [
        "Orbital", "EPIC"
      ]
    });

    await deploy('USDC', {
      contract: "Token",
      from : deployer,
      args: [
        "USD Coin", "USDC"
      ]
    });

    const usdc = await hre.ethers.getContract("USDC");
    const epic = await hre.ethers.getContract("EPIC");

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
            epic.address,
            usdc.address,
            deployer
          ],
        },
      },
    });

    const mintAmount = ethers.utils.parseEther('10000000')
    let tx = await epic.mint(mintAmount, deployer) //10 million
    tx.wait(1);

    tx = await usdc.mint(mintAmount, deployer) //10 million
    tx.wait(1);

    const bridge = await hre.ethers.getContract("Bridge");

    console.log("Bridge deployed to:", bridge.address);
    console.log("EPIC token deployed to:", epic.address);
    console.log("USDC token deployed to:", usdc.address);
}

module.exports.tags = ['deploy'];