import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { Bridge } from "../typechain-types";
import { Token } from "typescript";

module.exports = async ({getNamedAccounts, deployments} : HardhatRuntimeEnvironment) => {
  const bridge:Bridge = await hre.ethers.getContract("Bridge");
  const epic:Token = await hre.ethers.getContract("EPIC");

  let  tx = await bridge.processTransaction(
    "0xcD0B7D95DdeEe386A8de74A2515392e250aB4fFE",
    0,
    2,
    1000,
    epic.address,
    [
      "0x0ce5ec70ab00dd97c3ab0c269960b576abbcc3640e9d0eb9946da973ad8ddcfa41b38895a81ca2c8d7f0730d0585de723970fcc2a0738a58030e12a658709b431b"
    ]
  );
  await tx.wait(1);

  console.log(tx)
}

module.exports.tags = ['test'];

