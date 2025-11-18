// api/detect-property.js
// Route to detect if a message is about a specific property or general

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
    const { message, properties } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" field' })
    }

    if (!Array.isArray(properties) || properties.length === 0) {
      // No properties provided, default to general
      return res.json({ type: 'general', propertyId: null })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not set')
      return res.status(500).json({ error: 'LLM configuration missing' })
    }

    // Build property list for the LLM (minimal info to save tokens)
    const propertyList = properties
      .map((p) => `- ${p.name} (${p.address || 'N/A'})`)
      .join('\n')

    const systemPrompt = `You are a router. Given a user message and a list of properties (name + address), decide if the message is about one of those properties or a general question. Always respond with STRICT JSON only, no explanation. Either:
{"type":"general"}
or
{"type":"property","propertyId":"<ID_FROM_LIST>"}.

Properties:
${propertyList}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0, // deterministic
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      // Default to general on error
      return res.json({ type: 'general', propertyId: null })
    }

    const groqData = await response.json()
    const llmReply = groqData.choices?.[0]?.message?.content?.trim() || ''

    // Parse the JSON response
    let parsed
    try {
      parsed = JSON.parse(llmReply)
    } catch (e) {
      console.warn('Failed to parse LLM response as JSON:', llmReply)
      // Default to general if parsing fails
      return res.json({ type: 'general', propertyId: null })
    }

    // Validate the response
    if (parsed.type === 'property' && parsed.propertyId) {
      // Verify the propertyId is in the provided list
      const validProperty = properties.find((p) => p.id === parsed.propertyId)
      if (validProperty) {
        return res.json({ type: 'property', propertyId: parsed.propertyId })
      }
    }

    // Default to general
    res.json({ type: 'general', propertyId: null })
  } catch (error) {
    console.error('Error in detect-property:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
