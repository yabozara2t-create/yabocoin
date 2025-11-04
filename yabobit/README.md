# YaboBit Smart Contract

A simple fungible token (FT) written in Clarity for the Stacks blockchain. It supports minting, burning, transfers, and basic metadata.

## Project Layout

- `contracts/yabobit.clar` — YaboBit FT implementation
- `Clarinet.toml` — Clarinet project configuration
- `tests/` — Placeholder for unit tests (TypeScript)

## Requirements

- Clarinet 3.x installed and available on your PATH.
  - Verify: `clarinet --version`

## Quickstart

1. Check syntax:
   - `clarinet check`

2. Open REPL (Devnet) and interact:
   - `clarinet console`

   Example calls in the console (replace principals as needed):
   ```
   ;; First call to mint will set the caller as admin automatically
   (contract-call? .yabobit mint u100000 'ST2J...ABC)
   (contract-call? .yabobit get-total-supply)
   (contract-call? .yabobit get-balance 'ST2J...ABC)
   (contract-call? .yabobit transfer u50000 'ST2J...ABC 'ST3K...XYZ)
   (contract-call? .yabobit burn u1000 'ST3K...XYZ)
   ```

## Contract Interface

- Read-only
  - `get-name () -> (string-ascii)`
  - `get-symbol () -> (string-ascii)`
  - `get-decimals () -> uint` (default: `u6`)
  - `get-total-supply () -> uint`
  - `get-balance (who principal) -> uint`
  - `get-admin () -> (optional principal)`

- Public
  - `transfer (amount uint) (sender principal) (recipient principal) -> (response bool uint)`
  - `mint (amount uint) (recipient principal) -> (response bool uint)`
    - First caller sets `admin`; thereafter only `admin` can mint.
  - `burn (amount uint) (sender principal) -> (response bool uint)`

## Error Codes

- `u100` — insufficient-balance
- `u103` — not-authorized (sender mismatch)
- `u104` — invalid-amount (must be > u0)
- `u105` — invalid-recipient (sender = recipient)
- `u120` — admin-required (caller is not admin)

## Development

- Format code: `clarinet format` (formats all Clarity files)
- Run unit tests:
  - `npm install`
  - `npm test`

## Notes

- This FT is intentionally minimal and does not formally implement SIP-010 trait bindings. If you need SIP-010 compliance, we can add the trait and `impl-trait` bindings.
