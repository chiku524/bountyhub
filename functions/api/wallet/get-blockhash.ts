import { Hono } from 'hono'

interface Env {
  DB: any
  SOLANA_RPC_URL: string
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  // Use the custom QuickNode RPC URL from environment variables
  const rpcUrl = c.env.SOLANA_RPC_URL

  if (!rpcUrl) {
    return c.json({ 
      success: false, 
      error: 'SOLANA_RPC_URL not configured',
      suggestion: 'Please configure the SOLANA_RPC_URL environment variable'
    }, 500)
  }

  try {
    console.log(`Using custom RPC endpoint: ${rpcUrl}`)
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getLatestBlockhash',
        params: []
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json() as any
    if (result.error) {
      throw new Error(`RPC Error: ${result.error.message}`)
    }

    const blockhash = result.result?.value?.blockhash
    if (!blockhash) {
      throw new Error('Invalid response format: no blockhash found')
    }

    console.log(`Successfully got blockhash from custom RPC: ${blockhash}`)
    return c.json({ 
      success: true, 
      blockhash,
      endpoint: 'custom-quicknode',
      timestamp: Date.now()
    })
  } catch (error: any) {
    console.error('Failed to get blockhash from custom RPC:', error.message)
    return c.json({ 
      success: false, 
      error: `Failed to get blockhash: ${error.message}`,
      suggestion: 'Check your RPC endpoint configuration and network connectivity'
    }, 500)
  }
})

export default app 