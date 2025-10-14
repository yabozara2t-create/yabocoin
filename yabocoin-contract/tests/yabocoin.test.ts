
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("YaboCoin Token Tests", () => {
  
  describe("Initial State", () => {
    it("should initialize with correct token metadata", () => {
      const name = simnet.callReadOnlyFn("yabocoin", "get-name", [], deployer);
      const symbol = simnet.callReadOnlyFn("yabocoin", "get-symbol", [], deployer);
      const decimals = simnet.callReadOnlyFn("yabocoin", "get-decimals", [], deployer);
      const maxSupply = simnet.callReadOnlyFn("yabocoin", "get-max-supply", [], deployer);
      
      expect(name.result).toBeOk("YaboCoin");
      expect(symbol.result).toBeOk("YABO");
      expect(decimals.result).toBeOk(6);
      expect(maxSupply.result).toBeOk(1000000000000);
    });

    it("should initialize with deployer as owner", () => {
      const owner = simnet.callReadOnlyFn("yabocoin", "get-contract-owner", [], deployer);
      expect(owner.result).toBeOk(deployer);
    });

    it("should initialize with initial supply minted to deployer", () => {
      const balance = simnet.callReadOnlyFn("yabocoin", "get-balance", [deployer], deployer);
      const totalSupply = simnet.callReadOnlyFn("yabocoin", "get-total-supply", [], deployer);
      
      expect(balance.result).toBeOk(100000000000); // 100,000 YABO with 6 decimals
      expect(totalSupply.result).toBeOk(100000000000);
    });
  });

  describe("Transfer Functionality", () => {
    it("should allow token holder to transfer tokens", () => {
      const transferAmount = 1000000000; // 1,000 YABO
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "transfer",
        [transferAmount, deployer, wallet1, "none"],
        deployer
      );
      
      expect(result).toBeOk(true);
      
      // Check balances after transfer
      const senderBalance = simnet.callReadOnlyFn("yabocoin", "get-balance", [deployer], deployer);
      const recipientBalance = simnet.callReadOnlyFn("yabocoin", "get-balance", [wallet1], deployer);
      
      expect(senderBalance.result).toBeOk(99000000000); // 99,000 YABO
      expect(recipientBalance.result).toBeOk(1000000000); // 1,000 YABO
    });

    it("should fail when transferring more than balance", () => {
      const transferAmount = 200000000000; // 200,000 YABO (more than initial supply)
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "transfer",
        [transferAmount, deployer, wallet1, "none"],
        deployer
      );
      
      expect(result).toBeErr(); // Should fail due to insufficient balance
    });

    it("should fail when non-owner tries to transfer from another address", () => {
      const transferAmount = 1000000; // 1 YABO
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "transfer",
        [transferAmount, deployer, wallet2, "none"],
        wallet1 // wallet1 trying to transfer from deployer's account
      );
      
      expect(result).toBeErr(101); // ERR-NOT-TOKEN-OWNER
    });

    it("should fail when transferring zero amount", () => {
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "transfer",
        [0, deployer, wallet1, "none"],
        deployer
      );
      
      expect(result).toBeErr(103); // ERR-INVALID-AMOUNT
    });
  });

  describe("Minting Functionality", () => {
    it("should allow owner to mint tokens", () => {
      const mintAmount = 5000000000; // 5,000 YABO
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "mint",
        [mintAmount, wallet1],
        deployer
      );
      
      expect(result).toBeOk(true);
      
      // Check balance and total supply after mint
      const balance = simnet.callReadOnlyFn("yabocoin", "get-balance", [wallet1], deployer);
      const totalSupply = simnet.callReadOnlyFn("yabocoin", "get-total-supply", [], deployer);
      
      expect(balance.result).toBeOk(5000000000);
      expect(totalSupply.result).toBeOk(105000000000); // Initial + minted
    });

    it("should fail when non-owner tries to mint", () => {
      const mintAmount = 1000000000; // 1,000 YABO
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "mint",
        [mintAmount, wallet2],
        wallet1 // Non-owner trying to mint
      );
      
      expect(result).toBeErr(100); // ERR-OWNER-ONLY
    });

    it("should fail when minting would exceed max supply", () => {
      const mintAmount = 900000000000; // 900,000 YABO (would exceed max supply)
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "mint",
        [mintAmount, wallet1],
        deployer
      );
      
      expect(result).toBeErr(102); // ERR-INSUFFICIENT-BALANCE (used for max supply check)
    });

    it("should fail when minting zero amount", () => {
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "mint",
        [0, wallet1],
        deployer
      );
      
      expect(result).toBeErr(103); // ERR-INVALID-AMOUNT
    });
  });

  describe("Burning Functionality", () => {
    it("should allow token holder to burn their own tokens", () => {
      // First mint some tokens to wallet1
      simnet.callPublicFn("yabocoin", "mint", [2000000000, wallet1], deployer);
      
      const burnAmount = 500000000; // 500 YABO
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "burn",
        [burnAmount, wallet1],
        wallet1 // Token holder burning their own tokens
      );
      
      expect(result).toBeOk(true);
      
      // Check balance and total supply after burn
      const balance = simnet.callReadOnlyFn("yabocoin", "get-balance", [wallet1], deployer);
      const totalSupply = simnet.callReadOnlyFn("yabocoin", "get-total-supply", [], deployer);
      
      expect(balance.result).toBeOk(1500000000); // 2000 - 500 = 1500 YABO
    });

    it("should allow owner to burn tokens from any address", () => {
      // First mint some tokens to wallet2
      simnet.callPublicFn("yabocoin", "mint", [1000000000, wallet2], deployer);
      
      const burnAmount = 300000000; // 300 YABO
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "burn",
        [burnAmount, wallet2],
        deployer // Owner burning from wallet2
      );
      
      expect(result).toBeOk(true);
      
      const balance = simnet.callReadOnlyFn("yabocoin", "get-balance", [wallet2], deployer);
      expect(balance.result).toBeOk(700000000); // 1000 - 300 = 700 YABO
    });

    it("should fail when non-owner tries to burn from another address", () => {
      const burnAmount = 100000000; // 100 YABO
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "burn",
        [burnAmount, deployer],
        wallet1 // Non-owner trying to burn from deployer
      );
      
      expect(result).toBeErr(101); // ERR-NOT-TOKEN-OWNER
    });

    it("should fail when burning zero amount", () => {
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "burn",
        [0, wallet1],
        wallet1
      );
      
      expect(result).toBeErr(103); // ERR-INVALID-AMOUNT
    });
  });

  describe("Owner Management", () => {
    it("should allow current owner to transfer ownership", () => {
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "set-contract-owner",
        [wallet1],
        deployer
      );
      
      expect(result).toBeOk(true);
      
      const newOwner = simnet.callReadOnlyFn("yabocoin", "get-contract-owner", [], deployer);
      expect(newOwner.result).toBeOk(wallet1);
    });

    it("should fail when non-owner tries to transfer ownership", () => {
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "set-contract-owner",
        [wallet3],
        wallet2 // Non-owner trying to transfer ownership
      );
      
      expect(result).toBeErr(100); // ERR-OWNER-ONLY
    });
  });

  describe("Token URI Management", () => {
    it("should allow owner to set token URI", () => {
      const uri = "https://yabocoin.com/metadata.json";
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "set-token-uri",
        [`(some "${uri}")`],
        deployer
      );
      
      expect(result).toBeOk();
      
      const tokenUri = simnet.callReadOnlyFn("yabocoin", "get-token-uri", [], deployer);
      expect(tokenUri.result).toBeOk(`(some "${uri}")`);
    });

    it("should fail when non-owner tries to set token URI", () => {
      const uri = "https://malicious.com/metadata.json";
      
      const { result } = simnet.callPublicFn(
        "yabocoin",
        "set-token-uri",
        [`(some "${uri}")`],
        wallet1 // Non-owner trying to set URI
      );
      
      expect(result).toBeErr(100); // ERR-OWNER-ONLY
    });
  });

  describe("Read-Only Functions", () => {
    it("should return correct token information", () => {
      const name = simnet.callReadOnlyFn("yabocoin", "get-name", [], wallet1);
      const symbol = simnet.callReadOnlyFn("yabocoin", "get-symbol", [], wallet1);
      const decimals = simnet.callReadOnlyFn("yabocoin", "get-decimals", [], wallet1);
      const maxSupply = simnet.callReadOnlyFn("yabocoin", "get-max-supply", [], wallet1);
      
      expect(name.result).toBeOk("YaboCoin");
      expect(symbol.result).toBeOk("YABO");
      expect(decimals.result).toBeOk(6);
      expect(maxSupply.result).toBeOk(1000000000000);
    });

    it("should return correct balances for different addresses", () => {
      // Mint some tokens to create different balances
      simnet.callPublicFn("yabocoin", "mint", [1000000000, wallet1], deployer);
      simnet.callPublicFn("yabocoin", "mint", [2000000000, wallet2], deployer);
      
      const balance1 = simnet.callReadOnlyFn("yabocoin", "get-balance", [wallet1], deployer);
      const balance2 = simnet.callReadOnlyFn("yabocoin", "get-balance", [wallet2], deployer);
      const balance3 = simnet.callReadOnlyFn("yabocoin", "get-balance", [wallet3], deployer);
      
      expect(balance1.result).toBeOk(1000000000);
      expect(balance2.result).toBeOk(2000000000);
      expect(balance3.result).toBeOk(0); // No tokens minted to wallet3
    });
  });
});
