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
    const groqApiKey = process.env.GROQ_API_KEY
    
    // Validate API key
    if (!groqApiKey) {
      console.error('[/api/chat] GROQ_API_KEY not found in environment')
      console.error('[/api/chat] Available env vars:', Object.keys(process.env).filter(k => !k.startsWith('npm_')))
      return res.status(500).json({ error: 'LLM configuration missing (no GROQ_API_KEY)' })
    }

    // Handle body parsing
    let body = req.body || {}
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }
    const { messages, property } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid "messages" array' })
    }

    // Build system message
    let systemMessage = `You are a helpful property support assistant for a BnB management application. You help users with questions about their properties, amenities, check-in procedures, house rules, local recommendations, and general property management.

Be friendly, professional, and concise. Provide accurate information based on the property details provided.`

    // If a specific property is provided, add context about it
    if (property && property.id) {
      systemMessage += `

CURRENT PROPERTY CONTEXT:
Property: ${property.name}
Address: ${property.address || 'N/A'}
Description/Details:
${property.description || 'No additional details available'}

Please use this property information when answering questions to provide relevant and specific guidance.`
    } else {
      systemMessage += `

This is a general conversation. The user may ask about general property management topics, booking procedures, or general guidance.`
    }

    // Build messages array for Groq (convert format)
    const groqMessages = [
      {
        role: 'system',
        content: systemMessage,
      },
      ...messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ]

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      return res.status(500).json({ error: 'Failed to generate response from LLM' })
    }

    const groqData = await response.json()
    const content = groqData.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return res.status(500).json({ error: 'No content received from LLM' })
    }

    res.json({ content })
  } catch (error) {
    console.error('Error in chat:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
