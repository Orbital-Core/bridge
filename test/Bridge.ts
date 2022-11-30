import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token, Bridge } from "../typechain-types";
import { BigNumber, Signer } from "ethers";

describe("Bridge", function () {
  async function deploy() {
    const [owner] = await ethers.getSigners();

    const _Token = await ethers.getContractFactory("Token");
    const token:Token = await _Token.deploy("Test Token", "TST");

    const _Bridge = await ethers.getContractFactory("Bridge");
    const bridge:Bridge = await _Bridge.deploy();
    await bridge.initialize(token.address, owner.address);

    return { bridge, token };
  }

  describe("Operations", function () {
    let token:Token, bridge:Bridge;

    const getSignature = async (
      account: string,
      nonce: number,
      txnType: number,
      amount: number | BigNumber,
      signer: Signer
    ) => {
      const message = await bridge.getMessageHash(
        account,
        nonce,
        txnType,
        amount
      )

      const messageHashBinary = ethers.utils.arrayify(message);
      return await signer.signMessage(messageHashBinary)
    }

    beforeEach(async () => {
      ({ token, bridge } = await loadFixture(deploy));
      token.mint(ethers.utils.parseUnits("100","ether"))
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
        [
          await getSignature(newValidator.address, nonce, txnType, amount, currentValidator)
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
        [
          await getSignature(newValidator.address, nonce, txnType, amount, currentValidator),
          await getSignature(newValidator.address, nonce, txnType, amount, newValidator)
        ]
      )

      expect(await bridge.validators(newValidator.address)).to.be.equal(false)
      expect(await bridge.totalValidators()).to.be.equal(1)
    })

    it("deposit/withdraw tokens", async function () {
      await token.approve(bridge.address, ethers.utils.parseUnits("100","ether"));

      const externalOrbitalAccount = "0xaFcCFEcE5baa296d9c06e0AB569E3d81df3d24fE";
      await bridge.deposit(ethers.utils.parseUnits("100","ether"), externalOrbitalAccount);

      expect(await token.balanceOf(bridge.address)).to.be.equal(ethers.utils.parseUnits("100","ether"))

      await expect(bridge.deposit(ethers.utils.parseUnits("0.1","ether"), externalOrbitalAccount)).to.be.reverted
      
      const [currentValidator] = await ethers.getSigners();
      let nonce = 0;
      let txnType = 2;
      const amount = ethers.utils.parseUnits("100","ether");

      await bridge.processTransaction(
        currentValidator.address,
        nonce,
        txnType,
        amount,
        [
          await getSignature(currentValidator.address, nonce, txnType, amount, currentValidator)
        ]
      )

      expect(await token.balanceOf(bridge.address)).to.be.equal(ethers.utils.parseUnits("0","ether"))
      expect(await token.balanceOf(currentValidator.address)).to.be.equal(amount)
    });
  });
});
