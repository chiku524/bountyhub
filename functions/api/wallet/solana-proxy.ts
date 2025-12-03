import { Hono } from 'hono'

interface Env {
  DB: any
  SOLANA_RPC_URL: string
}

const app = new Hono<{ Bindings: Env }>()

// Proxy all Solana RPC requests to the custom QuickNode endpoint
app.all('*', async (c) => {
  const rpcUrl = c.env.SOLANA_RPC_URL

  if (!rpcUrl) {
    return c.json({ 
      error: 'SOLANA_RPC_URL not configured',
      suggestion: 'Please configure the SOLANA_RPC_URL environment variable'
    }, 500)
  }

  try {
    // Get the request body
    const body = await c.req.json().catch(() => null)
    
    // Forward the request to the QuickNode RPC
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('RPC proxy error:', errorText)
      return c.json({ 
        error: `RPC Error: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500)
    }

    const result = await response.json() as any
    return c.json(result)
  } catch (error: any) {
    console.error('Error in solana-proxy:', error)
    return c.json({ 
      error: `Proxy error: ${error.message}`,
      suggestion: 'Check your RPC endpoint configuration'
    }, 500)
  }
})

export default app 