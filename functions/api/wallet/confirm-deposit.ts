import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { virtualWallets, transactionLogs } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { Connection } from '@solana/web3.js'

interface Env {
  DB: any
  SOLANA_RPC_URL: string
  SOLANA_WALLET_ADDRESS: string
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const { transactionId, signature } = await c.req.json()
  const db = createDb(c.env.DB)

  try {
    const userId = await getUserIdFromSession(sessionId, db)
    if (!userId) return c.json({ error: 'Unauthorized' }, 401)

    if (!signature) {
      return c.json({ error: 'Solana transaction signature is required' }, 400)
    }

    // Validate signature format (Solana signatures are base58 encoded and typically 88 characters)
    if (!/^[1-9A-HJ-NP-Za-km-z]{88}$/.test(signature)) {
      return c.json({ error: 'Invalid transaction signature format' }, 400)
    }

    // Create Solana connection using environment variable
    const rpcUrl = c.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')

    // Check if this transaction signature has already been used
    const existingTransaction = await db.select().from(transactionLogs)
      .where(eq(transactionLogs.transactionId, signature))
      .limit(1)
    
    if (existingTransaction.length > 0) {
      return c.json({ error: 'This transaction signature has already been used for another deposit' }, 400)
    }

    let transaction: any = null

    // If transactionId is provided, try to find the pending transaction
    if (transactionId) {
      const transactionResult = await db.select().from(transactionLogs)
        .where(eq(transactionLogs.id, transactionId))
        .limit(1)
      
      if (transactionResult.length > 0) {
        transaction = transactionResult[0]
        if (transaction.status !== 'pending') {
          return c.json({ error: 'Transaction is not pending' }, 400)
        }
        if (transaction.type !== 'manual_deposit') {
          return c.json({ error: 'Transaction is not a deposit' }, 400)
        }
      }
    }

    // If no transaction found by ID, or no ID provided, create a new manual deposit transaction
    if (!transaction) {
      // Verify the Solana transaction first using the connection
      const txData = await getTransactionDetailsWithConnection(connection, signature)
      
      if (!txData.success) {
        return c.json({ error: `Failed to verify transaction: ${txData.error}` }, 400)
      }

      // Get platform address
      const platformAddress = c.env.SOLANA_WALLET_ADDRESS || 'Platform address not configured'
      
      // Verify transaction was sent to the correct platform address
      if (txData.toAddress !== platformAddress) {
        return c.json({ error: 'Transaction was not sent to the correct platform address' }, 400)
      }

      // Determine the BBUX amount (1:1 ratio with SOL)
      const bbuxAmount = txData.amount || 0
      
      if (bbuxAmount <= 0) {
        return c.json({ error: 'Could not verify transaction amount or amount is zero' }, 400)
      }
      
      // Validate amount is reasonable (max 100 SOL per deposit)
      if (bbuxAmount > 100) {
        return c.json({ error: 'Transaction amount is too large. Maximum deposit is 100 SOL.' }, 400)
      }
      
      // Validate amount is not suspiciously small (min 0.001 SOL)
      if (bbuxAmount < 0.001) {
        return c.json({ error: 'Transaction amount is too small. Minimum deposit is 0.001 SOL.' }, 400)
      }

      // Create new transaction record
      const newTransactionId = crypto.randomUUID()
      await db.insert(transactionLogs).values({
        id: newTransactionId,
        type: 'manual_deposit',
        userId: userId,
        amount: bbuxAmount,
        transactionId: signature, // Store the actual Solana signature
        timestamp: new Date(),
        status: 'completed', // Mark as completed since we verified it
        metadata: JSON.stringify({ 
          action: 'manual_deposit',
          solAmount: txData.amount,
          platformAddress: platformAddress,
          fromAddress: txData.fromAddress,
          toAddress: txData.toAddress
        }),
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Update virtual wallet balance
      const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (walletResult.length > 0) {
        const wallet = walletResult[0]
        await db.update(virtualWallets)
          .set({ 
            balance: wallet.balance + bbuxAmount, 
            totalDeposited: wallet.totalDeposited + bbuxAmount, 
            updatedAt: new Date() 
          })
          .where(eq(virtualWallets.userId, userId))
      }

      return c.json({ 
        success: true, 
        message: 'Manual deposit confirmed successfully', 
        bbuxAmount, 
        signature,
        transactionId: newTransactionId
      })
    } else {
      // Handle existing pending transaction
      
      // Get destination address from transaction metadata
      const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : {}
      
      let destinationAddress = metadata.userAddress
      
      // If no userAddress in metadata, this is likely a manual deposit to platform address
      if (!destinationAddress) {
        // For manual deposits, we need to verify the transaction matches the expected details
        const expectedAmount = metadata.expectedAmount
        const expectedPlatformAddress = metadata.platformAddress
        
        if (!expectedAmount || !expectedPlatformAddress) {
          return c.json({ error: 'Invalid deposit request - missing expected transaction details' }, 400)
        }
        
        // Verify the transaction exists and matches expected details using the connection
        const txData = await getTransactionDetailsWithConnection(connection, signature)
        
        if (!txData.success) {
          return c.json({ error: `Failed to verify transaction: ${txData.error}` }, 400)
        }
        
        // Verify transaction was sent to the correct platform address
        if (txData.toAddress !== expectedPlatformAddress) {
          return c.json({ error: 'Transaction was not sent to the correct platform address' }, 400)
        }
        
        // Verify transaction amount matches expected amount (with small tolerance for fees)
        if (txData.amount === undefined) {
          return c.json({ error: 'Could not verify transaction amount' }, 400)
        }
        
        const amountDifference = Math.abs(txData.amount - expectedAmount)
        
        if (amountDifference > 0.001) { // Allow 0.001 SOL tolerance for fees
          return c.json({ error: `Transaction amount does not match expected amount. Expected: ${expectedAmount} SOL, Got: ${txData.amount} SOL` }, 400)
        }
        
        // Use the platform address as the destination for verification purposes
        destinationAddress = expectedPlatformAddress
      }

      // Verify the Solana transaction using the connection
      const verification = await verifyTransactionWithConnection(connection, signature)
      if (!verification.success) return c.json({ error: 'Invalid transaction signature' }, 400)

      // Send BBUX tokens to the provided address (if needed, or just credit virtual balance)
      const bbuxAmount = transaction.amount // 1:1 ratio
      // Platform may not need to send on-chain tokens, just credit virtual balance

      // Update transaction status in the new table
      await db.update(transactionLogs)
        .set({ 
          status: 'completed', 
          transactionId: signature, 
          updatedAt: new Date() 
        })
        .where(eq(transactionLogs.id, transaction.id))

      // Update virtual wallet balance
      const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (walletResult.length > 0) {
        const wallet = walletResult[0]
        await db.update(virtualWallets)
          .set({ 
            balance: wallet.balance + bbuxAmount, 
            totalDeposited: wallet.totalDeposited + transaction.amount, 
            updatedAt: new Date() 
          })
          .where(eq(virtualWallets.userId, userId))
      }

      return c.json({ success: true, message: 'Deposit confirmed successfully', bbuxAmount, signature })
    }
  } catch (error) {
    console.error('Error confirming deposit:', error)
    return c.json({ error: 'Failed to confirm deposit' }, 500)
  }
})

// Helper function to get transaction details using a specific connection
async function getTransactionDetailsWithConnection(connection: Connection, signature: string): Promise<{ success: boolean; fromAddress?: string; toAddress?: string; amount?: number; error?: string }> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })
    
    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    // Check if transaction failed
    if (transaction.meta?.err) {
      return { success: false, error: 'Transaction failed' }
    }

    // Check transaction age to prevent replay attacks (max 24 hours old)
    const transactionTime = transaction.blockTime ? new Date(transaction.blockTime * 1000) : null
    const currentTime = new Date()
    const maxAgeHours = 24
    
    if (transactionTime) {
      const ageHours = (currentTime.getTime() - transactionTime.getTime()) / (1000 * 60 * 60)
      if (ageHours > maxAgeHours) {
        return { success: false, error: `Transaction is too old (${ageHours.toFixed(2)} hours). Maximum age allowed is ${maxAgeHours} hours.` }
      }
    }

    // Extract transfer details from SystemProgram transfer instruction
    let instructions: any[]
    let accountKeys: any
    
    if ('accountKeys' in transaction.transaction.message) {
      // Legacy message
      instructions = transaction.transaction.message.instructions
      accountKeys = transaction.transaction.message.accountKeys
    } else {
      // Versioned message
      instructions = transaction.transaction.message.compiledInstructions
      accountKeys = transaction.transaction.message.getAccountKeys()
    }
    
    for (const instruction of instructions) {
      const programId = accountKeys[instruction.programIdIndex].toString()
      if (programId === '11111111111111111111111111111111') { // SystemProgram
        const accounts = instruction.accounts
        if (accounts.length >= 2) {
          const fromAddress = accountKeys[accounts[0]].toString()
          const toAddress = accountKeys[accounts[1]].toString()
          
          // --- Always use instruction data if present and valid ---
          let amount = 0
          let usedInstructionData = false
          if (instruction.data) {
            try {
              const data = Buffer.from(instruction.data, 'base64')
              if (data.length >= 12) {
                let lamports = data.readBigUInt64LE(4)
                amount = Number(lamports) / 1e9
                // Fallback: if amount is unreasonably large, try big-endian
                if (amount > 1000) {
                  lamports = data.readBigUInt64BE(4)
                  amount = Number(lamports) / 1e9
                }
                // If still too large, fallback to balance change
                if (amount > 1000) {
                  amount = 0
                  usedInstructionData = false
                } else {
                  usedInstructionData = true
                }
              }
            } catch { /* ignore parse errors, fallback to balance change */ }
          }
          
          // Fallback to balance change ONLY if instruction data is missing or invalid
          if (!usedInstructionData && transaction.meta && transaction.meta.preBalances && transaction.meta.postBalances) {
            const receiverPreBalance = transaction.meta.preBalances[accounts[1]]
            const receiverPostBalance = transaction.meta.postBalances[accounts[1]]
            if (receiverPreBalance !== undefined && receiverPostBalance !== undefined) {
              amount = (receiverPostBalance - receiverPreBalance) / 1e9 // Convert lamports to SOL
            }
          }
          
          if (amount > 0) {
            return { 
              success: true, 
              fromAddress, 
              toAddress, 
              amount 
            }
          } else {
            return { success: false, error: 'Could not determine transaction amount' }
          }
        }
      }
    }
    return { success: false, error: 'No transfer instruction found' }
  } catch (error: any) {
    return { success: false, error: `Failed to get transaction details: ${error.message}` }
  }
}

// Helper function to verify transaction using a specific connection
async function verifyTransactionWithConnection(connection: Connection, signature: string): Promise<{ success: boolean; error?: string }> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })
    
    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }
    
    if (transaction.meta?.err) {
      return { success: false, error: 'Transaction failed' }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error verifying transaction:', error)
    return { success: false, error: `Failed to verify transaction: ${error.message}` }
  }
}

export default app 