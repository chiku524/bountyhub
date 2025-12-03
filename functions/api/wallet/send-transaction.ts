import { Hono } from 'hono'

interface Env {
  DB: any
  SOLANA_RPC_URL?: string
  CUSTOM_RPC_URL?: string
}

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
  try {
    const { serializedTransaction } = await c.req.json()
    
    if (!serializedTransaction) {
      return c.json({ error: 'No transaction data provided' }, 400)
    }

    // Handle different transaction formats
    let base64Tx: string
    
    if (Array.isArray(serializedTransaction)) {
      // If it's an array of numbers, convert to base64
      base64Tx = btoa(String.fromCharCode(...new Uint8Array(serializedTransaction)))
    } else if (typeof serializedTransaction === 'string') {
      if (serializedTransaction.startsWith('[')) {
        // If it's a JSON string array, parse and convert
        const array = JSON.parse(serializedTransaction)
        base64Tx = btoa(String.fromCharCode(...new Uint8Array(array)))
      } else {
        // Assume it's already base64
        base64Tx = serializedTransaction
      }
    } else {
      return c.json({ error: 'Invalid transaction data format' }, 400)
    }

    // Use custom RPC endpoint if available, fallback to SOLANA_RPC_URL, then default
    const rpcUrl = c.env.CUSTOM_RPC_URL || c.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    
    const rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'sendTransaction',
      params: [
        base64Tx,
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          encoding: 'base64'
        }
      ]
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('RPC request failed:', response.status, response.statusText, errorText)
      throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json() as any
    
    if (result.error) {
      console.error('RPC error:', result.error)
      throw new Error(`RPC error: ${result.error.message || JSON.stringify(result.error)}`)
    }

    return c.json({ 
      success: true, 
      signature: result.result 
    })
  } catch (error: any) {
    console.error('Error in send-transaction:', error)
    return c.json({ 
      error: 'Failed to send transaction', 
      details: error.message 
    }, 500)
  }
})

export default app 