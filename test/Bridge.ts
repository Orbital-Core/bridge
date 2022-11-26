import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token, Bridge } from "../typechain-types";
import { toUtf8Bytes } from "@ethersproject/strings";

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

    beforeEach(async () => {
      ({ token, bridge } = await loadFixture(deploy));
      token.mint(ethers.utils.parseUnits("100","ether"))
    })

    it("deposit tokens", async function () {
      await token.approve(bridge.address, ethers.utils.parseUnits("100","ether"));
      await bridge.deposit(ethers.utils.parseUnits("100","ether"), "external-account");

      expect(await token.balanceOf(bridge.address)).to.be.equal(ethers.utils.parseUnits("100","ether"))

      await expect(bridge.deposit(ethers.utils.parseUnits("0.1","ether"), "external-account")).to.be.reverted
    });

    it("add validator", async function () {
      const [currentValidator, newValidator] = await ethers.getSigners();

      const nonce = 0;
      const txnType = 0;
      const amount = 0;

      const message = await bridge.getMessageHash(
        newValidator.address,
        nonce,
        txnType,
        amount
      )

      const messageHashBinary = ethers.utils.arrayify(message);
      const signature = await currentValidator.signMessage(messageHashBinary)

      await bridge.processTransaction(
        newValidator.address,
        nonce,
        txnType,
        amount,
        [
          signature
        ]
      )

      expect(await bridge.validators(newValidator.address)).to.be.equal(true)
    })
  });
});
