# YaboCoin Deployment Guide

This guide explains how to deploy the YaboCoin smart contract to the Stacks blockchain.

## Prerequisites

1. **Clarinet CLI** - Version 3.7.0 or higher
2. **Stacks Wallet** - For testnet/mainnet deployments
3. **STX Tokens** - For deployment fees

## Local Testing

Before deploying, test the contract locally:

```bash
# Install dependencies
npm install

# Check contract syntax
clarinet check

# Run tests
npm test

# Start local development environment
clarinet integrate
```

## Deployment Steps

### 1. Configure Network Settings

Review and modify the network configuration files:

- `settings/Devnet.toml` - Local development
- `settings/Testnet.toml` - Stacks Testnet
- `settings/Mainnet.toml` - Stacks Mainnet

### 2. Deploy to Testnet

```bash
# Deploy to testnet
clarinet deploy --testnet

# Or deploy specific contract
clarinet deploy --testnet yabocoin
```

### 3. Deploy to Mainnet

```bash
# Deploy to mainnet (requires real STX)
clarinet deploy --mainnet

# Or deploy specific contract  
clarinet deploy --mainnet yabocoin
```

## Post-Deployment

### 1. Verify Contract

After deployment, verify the contract is working:

```bash
# Check contract exists
clarinet console

# In the console, test basic functions
(contract-call? .yabocoin get-name)
(contract-call? .yabocoin get-symbol)
(contract-call? .yabocoin get-total-supply)
```

### 2. Enable SIP-010 Trait (Production)

For mainnet deployment, uncomment the SIP-010 trait line in `contracts/yabocoin.clar`:

```clarity
;; Uncomment this line for mainnet deployment
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)
```

### 3. Update Token URI

After deployment, set the token metadata URI:

```bash
# In Clarinet console or through your wallet
(contract-call? .yabocoin set-token-uri (some "https://yabocoin.com/metadata.json"))
```

## Contract Addresses

Update these addresses after deployment:

### Testnet
- Contract Address: `ST...` (Update after testnet deployment)
- Transaction: `0x...` (Update with deployment transaction)

### Mainnet  
- Contract Address: `SP...` (Update after mainnet deployment)
- Transaction: `0x...` (Update with deployment transaction)

## Token Economics

- **Name**: YaboCoin
- **Symbol**: YABO
- **Decimals**: 6
- **Max Supply**: 1,000,000 YABO
- **Initial Supply**: 100,000 YABO (minted to deployer)

## Security Checklist

- [ ] Contract code reviewed
- [ ] All tests passing
- [ ] SIP-010 compliance verified
- [ ] Access controls tested
- [ ] Maximum supply enforced
- [ ] Burn functionality tested
- [ ] Owner transfer mechanism tested

## Monitoring

After deployment, monitor:

1. **Contract Activity**: Track mints, burns, and transfers
2. **Total Supply**: Monitor circulating supply
3. **Owner Operations**: Watch for ownership changes
4. **Error Rates**: Monitor transaction failures

## Troubleshooting

### Common Issues

1. **Deployment Failed**: Check STX balance for fees
2. **Contract Not Found**: Verify correct network and address
3. **Function Calls Fail**: Check error codes and permissions

### Error Codes Reference

- `u100`: ERR-OWNER-ONLY - Function restricted to contract owner
- `u101`: ERR-NOT-TOKEN-OWNER - Sender not authorized
- `u102`: ERR-INSUFFICIENT-BALANCE - Insufficient balance or max supply exceeded  
- `u103`: ERR-INVALID-AMOUNT - Amount must be greater than 0

## Support

For deployment issues:
- Check [Clarinet documentation](https://docs.hiro.so/clarinet)
- Visit [Stacks documentation](https://docs.stacks.co)
- Create an issue in the repository