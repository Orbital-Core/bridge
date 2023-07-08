import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token, Bridge } from "../typechain-types";
import { BigNumber, Signer } from "ethers";

describe("Bridge", function () {
  async function deploy() {
    const [owner] = await ethers.getSigners();

    const _Token = await ethers.getContractFactory("Token");
    const epic:Token = await _Token.deploy("EPIC Token", "EPIC");
    const usdc:Token = await _Token.deploy("USDC Token", "USDC");

    const _Bridge = await ethers.getContractFactory("Bridge");
    const bridge:Bridge = await _Bridge.deploy();
    await bridge.initialize(epic.address, usdc.address, owner.address);

    return { bridge, epic, usdc };
  }

  describe("Operations", function () {
    let usdc:Token, epic:Token, bridge:Bridge;

    const getSignature = async (
      account: string,
      nonce: number,
      txnType: number,
      amount: number | BigNumber,
      token: string,
      signer: Signer
    ) => {
      const message = await bridge.getMessageHash(
        account,
        nonce,
        txnType,
        amount,
        token
      )

      const messageHashBinary = ethers.utils.arrayify(message);
      return await signer.signMessage(messageHashBinary)
    }

    beforeEach(async () => {
      ({ epic, usdc, bridge } = await loadFixture(deploy));
      const [owner] = await ethers.getSigners();
      epic.mint(ethers.utils.parseUnits("100","ether"), owner.address)
      usdc.mint(ethers.utils.parseUnits("100","ether"), owner.address)
    })

    it("add/remove validator", async function () {
      const [currentValidator, newValidator] = await ethers.getSigners();

      let nonce = 0;
      let txnType = 0;
      const amount = 0;

      await bridge.processTransaction(
        newValidator.address,
        nonce,
        txnType,
        amount,
        ethers.constants.AddressZero,
        [
          await getSignature(newValidator.address, nonce, txnType, amount, ethers.constants.AddressZero, currentValidator)
        ]
      )

      expect(await bridge.validators(newValidator.address)).to.be.equal(true)
      expect(await bridge.totalValidators()).to.be.equal(2)

      nonce++;
      txnType = 1;

      await bridge.processTransaction(
        newValidator.address,
        nonce,
        txnType,
        amount,
        ethers.constants.AddressZero,
        [
          await getSignature(newValidator.address, nonce, txnType, amount, ethers.constants.AddressZero, currentValidator),
          await getSignature(newValidator.address, nonce, txnType, amount, ethers.constants.AddressZero, newValidator)
        ]
      )

      expect(await bridge.validators(newValidator.address)).to.be.equal(false)
      expect(await bridge.totalValidators()).to.be.equal(1)
    })

    it("deposit/withdraw tokens", async function () {
      await epic.approve(bridge.address, ethers.utils.parseUnits("100","ether"));

      const externalOrbitalAccount = "0xaFcCFEcE5baa296d9c06e0AB569E3d81df3d24fE";
      await bridge.deposit(epic.address, ethers.utils.parseUnits("100","ether"), externalOrbitalAccount);

      expect(await epic.balanceOf(bridge.address)).to.be.equal(ethers.utils.parseUnits("100","ether"))

      await expect(bridge.deposit(epic.address, ethers.utils.parseUnits("0.1","ether"), externalOrbitalAccount)).to.be.reverted
      
      const [currentValidator] = await ethers.getSigners();
      let nonce = 0;
      let txnType = 2;
      const amount = ethers.utils.parseUnits("100","ether");

      await bridge.processTransaction(
        currentValidator.address,
        nonce,
        txnType,
        amount,
        epic.address,
        [
          await getSignature(currentValidator.address, nonce, txnType, amount, epic.address, currentValidator)
        ]
      )

      expect(await epic.balanceOf(bridge.address)).to.be.equal(ethers.utils.parseUnits("0","ether"))
      expect(await epic.balanceOf(currentValidator.address)).to.be.equal(amount)
    });
  });
});
