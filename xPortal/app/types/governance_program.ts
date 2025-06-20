export const GovernanceProgram = {
  "version": "0.1.0",
  "name": "governance_program",
  "instructions": [
    {
      "name": "initializeGovernancePool",
      "accounts": [
        {
          "name": "governancePool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "governancePoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "governanceFeeRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "collectGovernanceFee",
      "accounts": [
        {
          "name": "governancePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governancePoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyCreator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyCreatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bountyAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createProposal",
      "accounts": [
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "governancePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposalCounter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "proposalType",
          "type": {
            "defined": "ProposalType"
          }
        },
        {
          "name": "amount",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "recipient",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "voteOnProposal",
      "accounts": [
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governancePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governancePoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "distributeVoterRewards",
      "accounts": [
        {
          "name": "governancePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governancePoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterTokenAccounts",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "totalRewardAmount",
          "type": "u64"
        },
        {
          "name": "voterAddresses",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "GovernancePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "governanceFeeRate",
            "type": "u64"
          },
          {
            "name": "totalFeesCollected",
            "type": "u64"
          },
          {
            "name": "totalRewardsDistributed",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "governancePool",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "proposalType",
            "type": {
              "defined": "ProposalType"
            }
          },
          {
            "name": "amount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "recipient",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": "ProposalStatus"
            }
          },
          {
            "name": "yesVotes",
            "type": "u64"
          },
          {
            "name": "noVotes",
            "type": "u64"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VoteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "publicKey"
          },
          {
            "name": "voter",
            "type": "publicKey"
          },
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "votedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ProposalType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "RewardDistribution"
          },
          {
            "name": "FeeRateChange"
          },
          {
            "name": "EmergencyWithdraw"
          }
        ]
      }
    },
    {
      "name": "ProposalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Approved"
          },
          {
            "name": "Rejected"
          },
          {
            "name": "Expired"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidFeeAmount",
      "msg": "Invalid fee amount"
    },
    {
      "code": 6001,
      "name": "TitleTooLong",
      "msg": "Title too long"
    },
    {
      "code": 6002,
      "name": "DescriptionTooLong",
      "msg": "Description too long"
    },
    {
      "code": 6003,
      "name": "ProposalNotActive",
      "msg": "Proposal not active"
    },
    {
      "code": 6004,
      "name": "ProposalNotExpired",
      "msg": "Proposal not expired"
    },
    {
      "code": 6005,
      "name": "ProposalExpired",
      "msg": "Proposal expired"
    },
    {
      "code": 6006,
      "name": "CannotVoteOnOwnProposal",
      "msg": "Cannot vote on own proposal"
    },
    {
      "code": 6007,
      "name": "AlreadyVoted",
      "msg": "Already voted"
    },
    {
      "code": 6008,
      "name": "InsufficientVotes",
      "msg": "Insufficient votes"
    },
    {
      "code": 6009,
      "name": "NoVoters",
      "msg": "No voters"
    },
    {
      "code": 6010,
      "name": "InvalidRewardAmount",
      "msg": "Invalid reward amount"
    },
    {
      "code": 6011,
      "name": "RewardTooSmall",
      "msg": "Reward too small"
    }
  ]
};

export type IDL = typeof GovernanceProgram; 