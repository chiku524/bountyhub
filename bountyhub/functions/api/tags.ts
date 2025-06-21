import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createDb } from '../../src/utils/db'
import { tags } from '../../drizzle/schema'
import { asc } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const allTags = await db.select().from(tags).orderBy(asc(tags.name))
    
    return c.json({
      success: true,
      data: allTags
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return c.json({ error: 'Failed to fetch tags' }, 500)
  }
})

export default app 