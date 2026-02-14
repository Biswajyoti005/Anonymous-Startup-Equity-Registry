# Anonymous Startup Equity Registry

## Overview

The **Anonymous Startup Equity Registry** is a blockchain-based platform built on Midnight that enables startup founders and early investors to record equity stakes on-chain while keeping cap table details private and hidden from competitors.

### Project Description
Startup founders and early investors record equity stakes on-chain with cap table details hidden from competitors and the public. This solution leverages Midnight's privacy features to achieve:

- **Privacy-Preserving Cap Tables:** Sensitive cap table details (shareholder names, equity percentages, vesting schedules) are encrypted and stored privately on-chain
- **Verifiable Equity Records:** Public ledger entries confirm equity stakes exist without revealing sensitive details
- **Competitor Protection:** Competitors cannot view confidential equity information
- **Immutable Records:** All equity registrations are permanently recorded on the blockchain
- **Regulatory Compliance:** Encrypted records can be disclosed to authorized parties (regulators, auditors) when needed

## Architecture

### Smart Contract Structure

The deployed contract uses a hybrid public-private state model:

**Public Ledger:**
- Tracks the count of registered equity stakes
- Anyone can verify that equity records exist
- No sensitive information is exposed

**Private State:**
- Stores encrypted cap table details:
  - Shareholder identities
  - Equity percentages and amounts
  - Vesting schedules
  - Share class information
- Only accessible to authorized stakeholders

### Core Circuits

1. **registerEquityStake()**
   - Registers a new equity stake on the public ledger
   - Updates encrypted private state with cap table details
   - Increments the stake counter

2. **verifyStakeExists()**
   - Verifies that equity stakes have been recorded
   - Returns boolean confirmation
   - Useful for compliance and audit checks

## Deployment Information

**Contract Address:** `1e68c52940d1820d3302b6b5a5badd08c70300d17d6ebd04ba468be433ae30b5`

**Network:** Midnight undeployed (local testnet)

**Deployment Seed:** `c5e5274a3a572015b37f6fc0fe5176d3dc8bcbb871d6eac7cd6e8c6eed5d206f`

Save this seed to restore your wallet and manage this contract.

## Getting Started

### Prerequisites
- Node.js 18+
- Midnight SDK packages (included in dependencies)
- Local Midnight network running (proof-server, indexer, node)

### Installation

```bash
cd equity-registry-contract
npm install
npm run build
```

### Deploying the Contract

```bash
# Generate a new seed or use an existing one
npm run deploy
```

The deployment script will:
1. Generate or import a wallet from your seed
2. Sync with the network
3. Register for dust token generation (required for transaction fees)
4. Deploy the contract
5. Save the contract address to `deployment.json`

### Interacting with the Contract

TO be implemented: Create a companion CLI/SDK to interact with the contract:

```typescript
// Example: Register an equity stake (pseudocode)
const equityRegistry = new EquityRegistry(contractAddress, provider);

await equityRegistry.registerEquityStake({
  shareholderId: "founder_1",
  equityPercentage: 25,
  vestingSchedule: "4-year linear",
  capTableData: encryptedCapTableData // encrypted with shareholder's key
});

// Verify stake exists
const exists = await equityRegistry.verifyStakeExists();
console.log(`Equity stakes registered: ${exists}`);
```

## Privacy Model

### What's Public
- Number of registered equity stakes
- Contract deployment address
- Transaction timestamps

### What's Private (Encrypted)
- Shareholder identities
- Equity percentages and amounts
- Vesting terms
- Share class details
- Funding rounds and valuations

### Access Control
- Only the shareholder and authorized parties (with their private key) can decrypt cap table details
- Regulatory disclosure can be facilitated through zero-knowledge proofs without exposing full details

## Use Cases

1. **Startup Equity Management**
   - Securely track founder and investor stakes
   - Maintain confidentiality during fundraising

2. **Investor Relations**
   - Share verifiable equity records with board members
   - Facilitate cap table management

3. **Regulatory Compliance**
   - Generate compliance reports with cryptographic proofs
   - Maintain immutable equity records for audits

4. **Acquisition/Exit Planning**
   - Create transparent equity records for M&A due diligence
   - Protect sensitive ownership details during negotiations

## Technical Stack

- **Blockchain:** Midnight Network (Zero-Knowledge Proofs)
- **Smart Contract Language:** Compact (Midnight's contract language)
- **Runtime:** TypeScript/Node.js
- **Key Libraries:**
  - `@midnight-ntwrk/wallet-sdk-*`: Wallet functionality
  - `@midnight-ntwrk/midnight-js-contracts`: Contract deployment
  - `@midnight-ntwrk/compact-js`: Compact contract compilation

## Future Enhancements

1. **Multi-Signature Authorization**
   - Require multiple founder/investor signatures for cap table changes
   
2. **Vesting Schedule Automation**
   - Automatically release vested equity based on time
   
3. **Secondary Market Support**
   - Enable private equity transfer between parties
   
4. **DAO Integration**
   - Governance based on encrypted equity shares
   
5. **Oracle Integration**
   - Connect to price feeds for valuation tracking

## Security Considerations

- All private cap table data is encrypted using Zswap (Midnight's shielded pool)
-Only authorized parties with the correct decryption keys can access sensitive data
- Zero-knowledge proofs ensure equity facts can be verified without revealing details
- All transactions are immutable and auditable

## License

© 2025 Midnight Foundation. This project follows the Apache License 2.0.

For more information about Midnight and ZK smart contracts, visit [midnight.network](https://midnight.network)
