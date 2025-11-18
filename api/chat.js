// api/chat.js
// Main chat endpoint that calls Groq with conversation history and property context

export default async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Handle body parsing
    let body = req.body || {}
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }
    const { messages, property, properties } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid "messages" array' })
    }

    // We will attempt a DB-first retrieval approach: answer only from database fields
    // If we cannot find relevant DB content we respond with a polite apology.

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase env vars missing for DB lookup')
      return res.status(500).json({ error: 'Database configuration missing' })
    }

    // Last user message is the query to answer
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    const query = (lastUserMsg && (lastUserMsg.content || lastUserMsg.text)) || ''
    const qLower = String(query).toLowerCase().trim()

    // Simple fuzzy match utility (local copy to avoid imports)
    function levenshteinDistance(a, b) {
      if (!a || !b) return Math.max(a?.length || 0, b?.length || 0)
      const matrix = []
      for (let i = 0; i <= b.length; i++) matrix[i] = [i]
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
          else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
      return matrix[b.length][a.length]
    }

    function similarity(a, b) {
      if (!a || !b) return 0
      a = a.toLowerCase().trim()
      b = b.toLowerCase().trim()
      if (a === b) return 1
      if (b.includes(a) || a.includes(b)) return 0.9
      const dist = levenshteinDistance(a, b)
      const maxLen = Math.max(a.length, b.length)
      return 1 - dist / Math.max(1, maxLen)
    }

    // Helper to evaluate a property record against the query
    function scoreProperty(prop, q) {
      const fields = [prop.name || '', prop.address || '', prop.description || '', prop.extra || '']
      let best = 0
      let bestField = null
      for (const f of fields) {
        const s = similarity(q, f)
        if (s > best) {
          best = s
          bestField = f
        }
      }
      return { score: best, field: bestField }
    }

    // If a property object was provided from client, check it first
    if (property && property.id) {
      const { name, address, description } = property
      const combined = `${name || ''} ${address || ''} ${description || ''}`
      const s = similarity(qLower, combined)
      if (s > 0.5) {
        // Return a deterministic DB-sourced answer using provided fields
        const content = `Based on the property record for "${name}":\n\n${description || 'No additional details available.'}`
        return res.json({ content })
      }
      // No matching info found in provided property
      return res.json({ content: "Sorry — I don't have information about that in the property record." })
    }

    // Otherwise, try to query Supabase properties table for relevant matches
    // Use Supabase REST API to fetch properties (server-side lookup)
    const propsRes = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/properties?select=*&order=created_at.asc&limit=300`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json',
      },
    })

    if (!propsRes.ok) {
      console.error('Failed to fetch properties from Supabase:', propsRes.status)
      return res.status(500).json({ error: 'Failed to read from database' })
    }

    const propList = await propsRes.json()

    // If client sent a properties list (from frontend) prefer that smaller list for speed
    const candidates = Array.isArray(properties) && properties.length > 0 ? properties : propList

    // Score each candidate
    let bestMatch = null
    let bestScore = 0
    for (const p of candidates) {
      const { score, field } = scoreProperty(p, qLower)
      if (score > bestScore) {
        bestScore = score
        bestMatch = { property: p, score, field }
      }
    }

    // Threshold for confident DB answer
    if (bestMatch && bestMatch.score > 0.55) {
      const p = bestMatch.property
      const matchedExcerpt = bestMatch.field || p.description || p.address || p.name
      const content = `Based on our records for "${p.name}":\n\n${matchedExcerpt}`
      return res.json({ content })
    }

    // No DB match found — per requirement, don't hallucinate: apologize and stop
    return res.json({ content: "Sorry — I don't have information about that." })
  } catch (error) {
    console.error('Error in chat:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
