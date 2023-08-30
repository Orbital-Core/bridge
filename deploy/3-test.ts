import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { Bridge } from "../typechain-types";
import { Token } from "typescript";

module.exports = async ({getNamedAccounts, deployments} : HardhatRuntimeEnvironment) => {
  const bridge:Bridge = await hre.ethers.getContract("Bridge");

  const VALIDATOR_ONE_PRIVATE_KEY = ""
  const VALIDATOR_TWO_PRIVATE_KEY = ""
  const EPIC_ADDRESS = "0xF77B59a2Fd8eA0dED3eE72A2942C298De8A3e802";
  const messageHash = await bridge.getMessageHash(
    "0xEc788F2D9A68274dF239b9b58f2593a95ec139f5",
    "100",
    2,
    "7000000000000000000000000",
    EPIC_ADDRESS,
  )

  const validatorOne = new hre.ethers.Wallet(VALIDATOR_ONE_PRIVATE_KEY)
  const validatorTwo = new hre.ethers.Wallet(VALIDATOR_TWO_PRIVATE_KEY)

  const messageHashBinaryOne = hre.ethers.utils.arrayify(messageHash);
  const signatureOne = await validatorOne.signMessage(messageHashBinaryOne);

  const messageHashBinaryTwo = hre.ethers.utils.arrayify(messageHash);
  const signatureTwo = await validatorTwo.signMessage(messageHashBinaryOne);

  // console.log(await bridge.totalValidators())

  let  tx = await bridge.processTransaction(
    "0xEc788F2D9A68274dF239b9b58f2593a95ec139f5",
    "100",
    2,
    "7000000000000000000000000",
    EPIC_ADDRESS,
    [
      signatureOne, signatureTwo
    ]
  );
  await tx.wait(1);

  // console.log(tx)
}

module.exports.tags = ['test'];

