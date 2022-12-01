import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { Bridge } from "../typechain-types";

module.exports = async ({getNamedAccounts, deployments} : HardhatRuntimeEnvironment) => {
  const bridge:Bridge = await hre.ethers.getContract("Bridge");
 
 
  let  tx = await bridge.processTransaction(
    "0xcD0B7D95DdeEe386A8de74A2515392e250aB4fFE",
    17,
    2,
    1000,
    [
      "0x36b6c02de668078fed4b6d2bb77a623c5ce1b5a65f8c6804a6ff8f3bc3b8b5f369c1820907b831f0aa5a99a0071420f38557d0def9120148b507a2e31b4333291c"
    ]
  );
  await tx.wait(1);

  console.log(tx)
}

module.exports.tags = ['test'];

