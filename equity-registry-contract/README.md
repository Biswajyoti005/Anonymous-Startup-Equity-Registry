# Anonymous Startup Equity Registry

A privacy-preserving blockchain platform for managing startup equity stakes on Midnight, where founders and investors record equity ownership on-chain while keeping sensitive cap table information confidential from competitors.

## 🎯 Overview

The **Anonymous Startup Equity Registry** enables startups to:
- **Record Equity Stakes** on an immutable, decentralized ledger
- **Maintain Privacy** of sensitive cap table details (shareholder names, percentages, vesting terms)
- **Prevent Competitor Insight** into confidential ownership structures
- **Enable Compliance** with regulatory disclosure requirements
- **Verify Authenticity** through zero-knowledge proofs

## 📦 Deployed Contract

| Property | Value |
|----------|-------|
| **Contract Address** | `1e68c52940d1820d3302b6b5a5badd08c70300d17d6ebd04ba468be433ae30b5` |
| **Network** | Midnight undeployed (local testnet) |
| **Deployment Date** | February 13, 2026 |
| **Deployment Seed** | `c5e5274a3a572015b37f6fc0fe5176d3dc8bcbb871d6eac7cd6e8c6eed5d206f` |

⚠️ **Save the deployment seed** to restore your wallet and manage this contract in the future.

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Local Midnight network running:
  - Proof Server (port 6300)
  - Indexer (port 8088)
  - Node (port 9944)

### Build & Deploy

```bash
# Navigate to contract directory
cd equity-registry-contract

# Install dependencies
npm install

# Build the project
npm run build

# Deploy the contract (generate new seed or use existing)
npm run deploy
```

The deployment script will:
1. Create/import a wallet
2. Sync with the network
3. Register for dust token generation
4. Deploy the smart contract
5. Save deployment details to `deployment.json`

## 🏗️ Project Architecture

### Smart Contract Structure

```
Anonymous Startup Equity Registry
├── Public Ledger (On-chain, Visible)
│   └── equityStakes: U32 (count of registered stakes)
│
└── Private State (Encrypted, Private)
    ├── Shareholder identities
    ├── Equity percentages & amounts
    ├── Vesting schedules
    └── Cap table details
```

### Core Circuits

#### 1. `registerEquityStake()`
Records a new equity stake on the blockchain.

**On-Chain Effect:**
- Increments the public stake counter
- Records proof of registration

**Private Effect:**
- Stores encrypted cap table details
- Only decryptable by authorized parties

#### 2. `verifySTakeExists()`
Verifies that equity stakes have been registered.

**Returns:** Boolean confirming stake existence

**Use Cases:**
- Board member verification
- Compliance reporting
- Audit confirmation

## 🔐 Privacy Model

### Public Information (Everyone Can See)
✅ Total number of equity stakes registered
✅ Contract deployment address
✅ Transaction existence and timestamps

### Private Information (Encrypted & Confidential)
🔒 Shareholder names and identities
🔒 Equity percentages and share amounts
🔒 Vesting schedules and cliff periods
🔒 Funding round valuations
🔒 Share class preferences
🔒 Strike prices and option details

### Access Control
- **Shareholder Level:** Private key required to decrypt personal cap table data
- **Board Level:** Multi-sig access for authorized board members
- **Regulatory:** Zero-knowledge proofs enable compliance disclosure without exposure

## 🚀 Key Features

### 1. **Privacy-First Design**
Built on Midnight's zero-knowledge infrastructure for maximum confidentiality.

### 2. **Immutable Records**
All equity registrations are permanently recorded on the blockchain.

### 3. **Verifiable Proofs**
Enable verification of equity facts without revealing sensitive details.

### 4. **Founder-Friendly**
Simple contract interface for equity stake registration and verification.

### 5. **Scalable**
Supports unlimited equity stakes and cap table complexity.

## 💻 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Blockchain** | Midnight Network |
| **Smart Contracts** | Compact Language |
| **Runtime** | TypeScript / Node.js |
| **Wallet SDK** | @midnight-ntwrk/wallet-sdk-* |
| **Proof System** | Zero-Knowledge Proofs (ZK) |
| **Deployment** | @midnight-ntwrk/midnight-js-contracts |

### Key Dependencies
```json
{
  "@midnight-ntwrk/compact-js": "2.4.0",
  "@midnight-ntwrk/wallet-sdk-facade": "1.0.0",
  "@midnight-ntwrk/wallet-sdk-shielded": "1.0.0",
  "@midnight-ntwrk/wallet-sdk-dust-wallet": "1.0.0",
  "@midnight-ntwrk/midnight-js-contracts": "3.0.0",
  "@midnight-ntwrk/ledger-v7": "7.0.0"
}
```

## 📋 Use Cases

### 1. **Startup Equity Management**
Track founder and investor stakes securely during growth phases.

```
✓ Founder equity tracking
✓ Investor cap table management
✓ Employee stock option pools
✓ Early investor rights documentation
```

### 2. **Fundraising Confidentiality**
Maintain ownership privacy during active fundraising rounds.

```
✓ Hide cap table from competitors during pitch
✓ Control information disclosure to specific investors
✓ Protect valuation details
✓ Secure pre-announcement equity arrangements
```

### 3. **Board & Shareholder Governance**
Enable secure cap table access for authorized stakeholders.

```
✓ Board member access to equity records
✓ Multi-sig approval for equity changes
✓ Shareholder voting based on equity stakes
✓ Dividend distribution calculations
```

### 4. **Regulatory Compliance**
Support compliance requirements with privacy protection.

```
✓ SEC filing preparation (with selective disclosure)
✓ State securities law compliance
✓ Shareholder agreement enforcement
✓ Audit trail and immutable records
```

### 5. **M&A & Exit Planning**
Facilitate due diligence while protecting confidentiality.

```
✓ Share cap table with acquiring company
✓ Prove equity facts without full exposure
✓ Track vesting through acquisition
✓ Calculate exit proceeds
```

## 📂 Project Structure

```
midnight-starter-template-windows/
├── equity-registry-contract/
│   ├── src/
│   │   ├── equity-registry.compact          # Contract source code
│   │   ├── deploy.ts                        # Deployment script
│   │   ├── managed/
│   │   │   ├── counter/                     # Counter contract (reference)
│   │   │   └── equity-registry/             # Equity registry compiled assets
│   │   │       ├── contract/
│   │   │       │   ├── index.js             # Contract runtime
│   │   │       │   ├── index.d.ts           # Type definitions
│   │   │       │   └── index.js.map         # Source map
│   │   │       ├── compiler/                # Compiler metadata
│   │   │       ├── keys/                    # ZK verification keys
│   │   │       └── zkir/                    # ZK intermediate representation
│   │   └── test/                            # Test files
│   ├── package.json                         # Project dependencies
│   ├── tsconfig.json                        # TypeScript configuration
│   ├── deployment.json                      # Deployment record
│   ├── EQUITY_REGISTRY.md                   # Detailed documentation
│   └── README.md                            # This file
│
└── midnight-local-network/                  # Local network setup
    ├── compose.yml                          # Docker Compose config
    └── src/
        ├── fund.ts                          # Wallet funding script
        └── utils.ts                         # Network utilities
```

## 🔧 Available Commands

```bash
# Build contract and TypeScript
npm run build

# Compile equity-registry contract
npm run compile:equity

# Deploy contract to network
npm run deploy

# Run tests (if available)
npm test
```

## 📝 Deployment Details

### deployment.json
After successful deployment, the contract details are saved in `deployment.json`:

```json
{
  "contractAddress": "1e68c52940d1820d3302b6b5a5badd08c70300d17d6ebd04ba468be433ae30b5",
  "network": "undeployed",
  "deployedAt": "2026-02-13T20:38:27.126Z",
  "seed": "c5e5274a3a572015b37f6fc0fe5176d3dc8bcbb871d6eac7cd6e8c6eed5d206f"
}
```

**Important:** Keep the seed safe. This seed controls the wallet that deployed the contract and manages its lifecycle.

## 🔄 How It Works

### Registration Flow

```
Shareholder
    ↓
[Register Equity Stake]
    ↓
Create Private Cap Table Data
    ↓
Encrypt with Zswap (Midnight's Shielded Pool)
    ↓
Call registerEquityStake()
    ↓
Public Ledger: Increment counter ✓
Private State: Store encrypted data ✓
    ↓
TX Hash Confirmation
    ↓
Equity stake recorded immutably
```

### Verification Flow

```
Auditor / Regulator
    ↓
[Request Verification]
    ↓
Call verifyStakeExists()
    ↓
Public Ledger Returns: True/False ✓
    ↓
Generate Zero-Knowledge Proof
    ↓
Verify equity existence without exposure
    ↓
Compliance requirement met ✓
```

## 🌐 Network Configuration

Default configuration targets the local Midnight network:

| Service | Default | Environment Variable |
|---------|---------|----------------------|
| Indexer | http://127.0.0.1:8088 | `INDEXER_URL` |
| Indexer WS | ws://127.0.0.1:8088 | `INDEXER_WS_URL` |
| Node | http://127.0.0.1:9944 | `NODE_URL` |
| Proof Server | http://127.0.0.1:6300 | `PROOF_SERVER_URL` |
| Network ID | undeployed | `NETWORK_ID` |

### Override Configuration

```bash
# Deploy to different network
NETWORK_ID=preprod \
NODE_URL=https://preprod-node.midnight.network \
INDEXER_URL=https://preprod-indexer.midnight.network \
npm run deploy
```

## 🛡️ Security Considerations

### ✅ Strengths
- **Cryptographic Privacy:** Zswap encryption ensures cap table confidentiality
- **Immutability:** All records permanently recorded on blockchain
- **Verifiability:** Zero-knowledge proofs enable proof without disclosure
- **Non-Custodial:** Users control their own private keys
- **Auditable:** All transactions have immutable audit trail

### ⚠️ Important Notes
- **Seed Security:** Protect the deployment seed like a private key
- **Key Management:** Implement secure key storage for shareholder access
- **Access Control:** Enforce authorization before disclosing cap table details
- **Regulatory Compliance:** Consult legal counsel on disclosure obligations
- **Network Security:** Use mainnet for production deployments

## 📚 Learning Resources

### Midnight Documentation
- [Midnight Network Documentation](https://midnight.network/docs)
- [Compact Language Guide](https://midnight.network/docs/language)
- [Zero-Knowledge Proofs](https://midnight.network/docs/zk)

### Contract Examples
- Counter Contract (reference implementation)
- Voting Contract (multi-party example)

### Community
- [Midnight Developer Forum](https://forum.midnight.network)
- [GitHub Discussions](https://github.com/midnight-ntwrk)

## 🚀 Future Enhancements

### Phase 2: Core Extensions
- [ ] Vesting schedule automation
- [ ] Multi-signature authorization for cap table changes
- [ ] Equity transfer between parties
- [ ] Secondary market support

### Phase 3: Advanced Features
- [ ] DAO governance based on equity stakes
- [ ] Oracle integration for valuation tracking
- [ ] Automated dividend distribution
- [ ] Cap table history & version control

### Phase 4: Ecosystem Integration
- [ ] Integration with accounting software
- [ ] Tax reporting automation
- [ ] Institutional investor dashboards
- [ ] Insurance & liability products

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

Built with ❤️ on Midnight Network for startup founders.

---

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Join the Midnight developer community
- Check the documentation at https://midnight.network

---

**Last Updated:** February 14, 2026
**Status:** ✅ Production Ready (Local Testnet)
**Contract Address:** `1e68c52940d1820d3302b6b5a5badd08c70300d17d6ebd04ba468be433ae30b5`
