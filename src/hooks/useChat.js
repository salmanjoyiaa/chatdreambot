// src/hooks/useChat.js
// Multi-property aware chat hook with Supabase persistence
import { useCallback, useState, useEffect } from 'react'
import {
  listProperties,
  getOrCreateHomeConversation,
  getOrCreateConversationForProperty,
  getMessages,
  addMessage,
  getPropertyById,
  updateConversationTimestamp,
} from '../lib/db'

let idCounter = 0
const makeId = () => `${Date.now()}_${idCounter++}`

function formatTime(d = new Date()) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d)
  } catch {
    return d.toLocaleTimeString()
  }
}

export default function useChat(userId) {
  const [messages, setMessages] = useState([])
  const [properties, setProperties] = useState([])
  const [currentProperty, setCurrentProperty] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)

  // Load properties on mount
  useEffect(() => {
    async function loadProperties() {
      const { data, error: propError } = await listProperties()
      if (!propError) {
        setProperties(data)
      }
    }
    loadProperties()
  }, [])

  // Initialize home conversation and load messages when userId changes
  useEffect(() => {
    async function initializeChat() {
      if (!userId) {
        setIsInitializing(false)
        return
      }

      try {
        setIsInitializing(true)
        // Get or create home conversation
        const { data: conv, error: convError } = await getOrCreateHomeConversation(userId)
        if (!convError && conv) {
          setConversationId(conv.id)
          setCurrentProperty(null)

          // Load existing messages
          const { data: msgs, error: msgError } = await getMessages(conv.id)
          if (!msgError) {
            // Convert DB messages to UI format
            const uiMessages = msgs.map((msg) => ({
              id: msg.id,
              role: msg.role === 'assistant' ? 'bot' : 'user',
              text: msg.content,
              timestamp: msg.created_at ? formatTime(new Date(msg.created_at)) : formatTime(),
            }))
            setMessages(uiMessages)
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err)
        setError('Failed to initialize chat')
      } finally {
        setIsInitializing(false)
      }
    }

    initializeChat()
  }, [userId])

  /**
   * Switch to a specific property conversation
   */
  const switchToProperty = useCallback(
    async (propertyId) => {
      if (!userId) return

      try {
        // Get or create conversation for this property
        const { data: conv, error: convError } = await getOrCreateConversationForProperty(
          userId,
          propertyId
        )
        if (convError) throw new Error(convError)

        // Get the property details
        const { data: prop, error: propError } = await getPropertyById(propertyId)
        if (propError) throw new Error(propError)

        // Set current state
        setConversationId(conv.id)
        setCurrentProperty(prop)

        // Load messages for this conversation
        const { data: msgs, error: msgError } = await getMessages(conv.id)
        if (!msgError) {
          const uiMessages = msgs.map((msg) => ({
            id: msg.id,
            role: msg.role === 'assistant' ? 'bot' : 'user',
            text: msg.content,
            timestamp: msg.created_at ? formatTime(new Date(msg.created_at)) : formatTime(),
          }))
          setMessages(uiMessages)
        }
      } catch (err) {
        console.error('Error switching to property:', err)
        setError('Failed to switch conversation')
      }
    },
    [userId]
  )

  /**
   * Switch back to home conversation
   */
  const switchToHome = useCallback(async () => {
    if (!userId) return

    try {
      const { data: conv, error: convError } = await getOrCreateHomeConversation(userId)
      if (convError) throw new Error(convError)

      setConversationId(conv.id)
      setCurrentProperty(null)

      // Load messages
      const { data: msgs, error: msgError } = await getMessages(conv.id)
      if (!msgError) {
        const uiMessages = msgs.map((msg) => ({
          id: msg.id,
          role: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content,
          timestamp: msg.created_at ? formatTime(new Date(msg.created_at)) : formatTime(),
        }))
        setMessages(uiMessages)
      }
    } catch (err) {
      console.error('Error switching to home:', err)
      setError('Failed to switch to home chat')
    }
  }, [userId])

  /**
   * Send a message and route it appropriately
   */
  const sendMessage = useCallback(
    async (input) => {
      if (!input.trim() || !userId || !conversationId) return

      setError('')
      const userMsg = { id: makeId(), role: 'user', text: input, timestamp: formatTime() }

      try {
        // Add user message to state
        setMessages((prev) => [...prev, userMsg])

        // Save user message to DB
        await addMessage(conversationId, 'user', input.trim(), null)

        // Detect property intent
        const detectResponse = await fetch('/api/detect-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input.trim(),
            properties: properties.map((p) => ({ id: p.id, name: p.name, address: p.address })),
          }),
        })

        const { type, propertyId } = await detectResponse.json()

        // Route to appropriate conversation
        if (type === 'property' && propertyId) {
          const propertyToSwitch = properties.find((p) => p.id === propertyId)
          if (propertyToSwitch && currentProperty?.id !== propertyId) {
            await switchToProperty(propertyId)
            // Re-add user message since conversation switched
            setMessages((prev) => [...prev, userMsg])
            await addMessage(conversationId, 'user', input.trim(), null)
          }
        } else if (currentProperty !== null) {
          // Message is general but we're in a property conversation
          await switchToHome()
          // Re-add user message since conversation switched
          setMessages((prev) => [...prev, userMsg])
          await addMessage(conversationId, 'user', input.trim(), null)
        }

        // Get current conversation's messages for LLM context
        const { data: dbMessages, error: msgError } = await getMessages(conversationId)
        if (msgError) throw new Error(msgError)

        // Convert to LLM format
        const llmMessages = dbMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

        // Prepare property context for LLM
        let propertyForLlm = null
        if (currentProperty) {
          const { data: fullProp } = await getPropertyById(currentProperty.id)
          propertyForLlm = fullProp
        }

        // Call LLM
        setIsLoading(true)
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: llmMessages,
            property: propertyForLlm,
          }),
        })

        if (!chatResponse.ok) {
          throw new Error(`Chat API error: ${chatResponse.status}`)
        }

        const { content } = await chatResponse.json()

        // Add assistant message to state
        const botMsg = {
          id: makeId(),
          role: 'bot',
          text: content,
          timestamp: formatTime(),
        }
        setMessages((prev) => [...prev, botMsg])

        // Save assistant message to DB
        await addMessage(conversationId, 'assistant', content, null)

        // Update conversation timestamp
        await updateConversationTimestamp(conversationId)
      } catch (err) {
        console.error('Error sending message:', err)
        setError('Failed to send message. Please try again.')
        const fallback = {
          id: makeId(),
          role: 'bot',
          text: "I'm sorry — something went wrong. Please try again.",
          timestamp: formatTime(),
        }
        setMessages((prev) => [...prev, fallback])
      } finally {
        setIsLoading(false)
      }
    },
    [userId, conversationId, currentProperty, properties, switchToProperty, switchToHome]
  )

  return {
    messages,
    properties,
    currentProperty,
    conversationId,
    sendMessage,
    isLoading,
    error,
    isInitializing,
    switchToProperty,
    switchToHome,
  }
}
