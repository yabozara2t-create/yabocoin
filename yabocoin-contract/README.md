# YaboCoin (YABO) Smart Contract

A SIP-010 compliant fungible token smart contract built on the Stacks blockchain using Clarinet.

## Overview

YaboCoin (YABO) is a fungible token that implements the SIP-010 standard, providing a secure and standardized way to create, transfer, and manage digital tokens on the Stacks blockchain.

## Token Details

- **Name**: YaboCoin
- **Symbol**: YABO  
- **Decimals**: 6
- **Max Supply**: 1,000,000 YABO (1,000,000,000,000 micro-units)
- **Initial Supply**: 100,000 YABO minted to contract deployer

## Features

### Core SIP-010 Functions
- ✅ **Transfer**: Send tokens between addresses
- ✅ **Balance Query**: Check token balance for any address
- ✅ **Total Supply**: Get current circulating supply
- ✅ **Token Metadata**: Name, symbol, decimals, and URI support

### Extended Functions
- 🔥 **Burn**: Destroy tokens (owner or token holder can burn)
- 🏭 **Mint**: Create new tokens (owner only, respects max supply)
- 🔧 **Owner Management**: Transfer contract ownership
- 🌐 **URI Management**: Set and update token metadata URI

## Smart Contract Structure

```clarity
;; Core token definition
(define-fungible-token yabocoin)

;; Key constants
TOKEN-NAME: "YaboCoin"
TOKEN-SYMBOL: "YABO" 
TOKEN-DECIMALS: 6
TOKEN-MAX-SUPPLY: 1,000,000,000,000 micro-units
```

## Functions

### Public Functions

#### `transfer`
```clarity
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34)))))
```
Transfer tokens from one address to another.

#### `mint` 
```clarity
(define-public (mint (amount uint) (to principal)))
```
Mint new tokens (owner only). Respects maximum supply limit.

#### `burn`
```clarity
(define-public (burn (amount uint) (from principal)))
```
Burn tokens from an address (owner or token holder can burn their own tokens).

#### `set-token-uri`
```clarity
(define-public (set-token-uri (value (optional (string-utf8 256)))))
```
Set metadata URI for the token (owner only).

#### `set-contract-owner`
```clarity
(define-public (set-contract-owner (new-owner principal)))
```
Transfer contract ownership (current owner only).

### Read-Only Functions

#### `get-name`, `get-symbol`, `get-decimals`
Get basic token information.

#### `get-balance`
```clarity
(define-read-only (get-balance (who principal)))
```
Get token balance for a specific address.

#### `get-total-supply`, `get-max-supply`
Get current and maximum token supply.

#### `get-token-uri`
Get metadata URI if set.

#### `get-contract-owner`
Get current contract owner address.

## Error Codes

- `u100`: ERR-OWNER-ONLY - Function can only be called by contract owner
- `u101`: ERR-NOT-TOKEN-OWNER - Sender is not authorized for this operation
- `u102`: ERR-INSUFFICIENT-BALANCE - Would exceed maximum supply or insufficient balance
- `u103`: ERR-INVALID-AMOUNT - Amount must be greater than 0

## Development Setup

### Prerequisites

- [Clarinet](https://docs.hiro.so/clarinet) (v3.7.0+)
- Node.js (for testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yabocoin-contract
```

2. Install dependencies:
```bash
npm install
```

### Testing

Run the test suite:
```bash
npm test
```

Run specific tests:
```bash
npm test -- yabocoin.test.ts
```

### Contract Validation

Check contract syntax:
```bash
clarinet check
```

### Deployment

Deploy to testnet:
```bash
clarinet deploy --testnet
```

Deploy to mainnet:
```bash
clarinet deploy --mainnet
```

## Usage Examples

### Transferring Tokens
```clarity
;; Transfer 1000.000000 YABO (1000000000 micro-units) from sender to recipient
(contract-call? .yabocoin transfer u1000000000 tx-sender 'SP1234...RECIPIENT none)
```

### Minting Tokens (Owner Only)
```clarity
;; Mint 500.000000 YABO to a specific address
(contract-call? .yabocoin mint u500000000 'SP1234...RECIPIENT)
```

### Burning Tokens
```clarity
;; Burn 100.000000 YABO from sender's balance
(contract-call? .yabocoin burn u100000000 tx-sender)
```

### Checking Balance
```clarity
;; Get balance for a specific address
(contract-call? .yabocoin get-balance 'SP1234...ADDRESS)
```

## Security Considerations

- Contract owner has privileged access to mint and administrative functions
- Maximum supply is enforced to prevent infinite inflation
- Standard SIP-010 compliance ensures compatibility with wallets and exchanges
- Transfer authorization follows standard patterns (sender or contract caller)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## Support

For questions and support:
- Create an issue on GitHub
- Check the [Stacks documentation](https://docs.stacks.co)
- Visit the [Clarinet documentation](https://docs.hiro.so/clarinet)

## Changelog

### v1.0.0
- Initial release
- SIP-010 compliant fungible token
- Basic mint, burn, and transfer functionality
- Owner management system
- Comprehensive test coverage