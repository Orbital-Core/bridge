import { ethers, upgrades } from "hardhat";

async function main() {
  const [validator] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Orbital", "EPIC");
  await token.deployed()

  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await upgrades.deployProxy(Bridge, [
    token.address,
    validator.address
  ]);
  await bridge.deployed();

  const tx = await token.mint("10000000000000000000000000") //10 million
  tx.wait(1);

  console.log("Bridge deployed to:", bridge.address);
  console.log("EPIC token deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
