import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import hre from "hardhat";
import { Token, Bridge } from "../typechain-types";

module.exports = async ({getNamedAccounts, deployments} : HardhatRuntimeEnvironment) => {
  const epic:Token = await hre.ethers.getContract("EPIC");
  const bridge:Bridge = await hre.ethers.getContract("Bridge");
 
  const depositAmount = ethers.utils.parseEther('10')
  const orbitalAccount = "0xfDe303527ed17ee0647b8A3f89A1692E60FDF22f";
 
  let tx = await epic.approve(bridge.address, depositAmount);
  await tx.wait(1);

  tx = await bridge.deposit(epic.address, depositAmount, orbitalAccount);
  await tx.wait(1);

  console.log(tx)
}

module.exports.tags = ['deposit'];

