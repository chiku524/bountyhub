export const BountyProgram = {
  IDL: {
    "version": "0.1.0",
    "name": "bounty_program",
    "instructions": [
      {
        "name": "createBounty",
        "accounts": [
          {
            "name": "bounty",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "userTokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "bountyTokenAccount",
            "isMut": true,
            "isSigner": false
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
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          }
        ]
      },
      {
        "name": "claimBounty",
        "accounts": [
          {
            "name": "bounty",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "winner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "bountyTokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "winnerTokenAccount",
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
        "name": "refundBounty",
        "accounts": [
          {
            "name": "bounty",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "bountyTokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "authorityTokenAccount",
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
      }
    ],
    "accounts": [
      {
        "name": "Bounty",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "expiresAt",
              "type": "i64"
            },
            {
              "name": "status",
              "type": {
                "defined": "BountyStatus"
              }
            },
            {
              "name": "winner",
              "type": {
                "option": "publicKey"
              }
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
        "name": "BountyStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Active"
            },
            {
              "name": "Claimed"
            },
            {
              "name": "Refunded"
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
        "name": "BountyExpired",
        "msg": "Bounty has expired"
      },
      {
        "code": 6001,
        "name": "BountyNotActive",
        "msg": "Bounty is not active"
      },
      {
        "code": 6002,
        "name": "BountyNotExpired",
        "msg": "Bounty is not expired"
      },
      {
        "code": 6003,
        "name": "Unauthorized",
        "msg": "Unauthorized"
      }
    ]
  }
}; 