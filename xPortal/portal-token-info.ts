const portalTokenInfo = {
  mint: "HbLcoUfkeBPNrWs4w7PmkeS3FHbxB8DMPSe2G1cReCwH",
  mintAuthority: "e6EdfgpEdo48zUKFC18cADxTqgbt68JE8uDjAgdCzkp",
  platformTokenAccount: "BS19RWRhxoFPRcUr61f2cTXypCK7xGzk8mYPkJbJd7vi",
  payer: "e6EdfgpEdo48zUKFC18cADxTqgbt68JE8uDjAgdCzkp",
  config: {
    name: "BountyBucks",
    symbol: "BBUX",
    decimals: 9,
    initialSupply: 1000000000, // 1 billion tokens
    exchangeRate: 1000,
    description: "BountyBucks - The native token for Portal's decentralized bounty platform with staking pools and integrity system"
  },
  tokenSale: {
    totalTokensForSale: 200000000, // 20% of supply (200M tokens)
    pricePerToken: 0.001, // SOL per BBUX
    minInvestment: 0.1, // SOL
    maxInvestment: 10, // SOL
    vestingPeriod: 12, // months
    cliffPeriod: 3, // months
    softCap: 100, // SOL
    hardCap: 500, // SOL
  },
  allocation: {
    publicSale: 20, // 20% - 200M tokens
    team: 15, // 15% - 150M tokens (2-year vesting)
    advisors: 5, // 5% - 50M tokens (1-year vesting)
    marketing: 10, // 10% - 100M tokens
    development: 20, // 20% - 200M tokens
    liquidity: 15, // 15% - 150M tokens
    community: 10, // 10% - 100M tokens
    reserve: 5, // 5% - 50M tokens
  },
  network: "devnet"
};

export default portalTokenInfo;