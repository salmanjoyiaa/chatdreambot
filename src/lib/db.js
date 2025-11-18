// src/lib/db.js
// Database helper layer for Supabase operations

import { supabase } from './supabaseClient'

/**
 * List all properties ordered by created_at
 */
export async function listProperties() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error listing properties:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting property by ID:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get a single property by slug
 */
export async function getPropertyBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting property by slug:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Create a new property
 */
export async function createProperty(name, slug, address, description) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([{ name, slug, address, description }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating property:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get or create a "Home" conversation (property_id = null) for a user
 */
export async function getOrCreateHomeConversation(userId) {
  try {
    // Try to find existing home conversation
    let { data: existingConv, error: selectError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .is('property_id', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!selectError && existingConv) {
      return { data: existingConv, error: null }
    }

    // If not found, create a new home conversation
    const { data: newConv, error: insertError } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          property_id: null,
          title: 'Home Chat',
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError
    return { data: newConv, error: null }
  } catch (error) {
    console.error('Error getting or creating home conversation:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get or create a conversation for a specific property
 */
export async function getOrCreateConversationForProperty(userId, propertyId) {
  try {
    // Try to find existing conversation for this user + property
    let { data: existingConv, error: selectError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!selectError && existingConv) {
      return { data: existingConv, error: null }
    }

    // If not found, get property details and create new conversation
    const { data: property, error: propError } = await getPropertyById(propertyId)
    if (propError) throw new Error(`Property not found: ${propError}`)

    const { data: newConv, error: insertError } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          property_id: propertyId,
          title: `Chat for: ${property.name}`,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError
    return { data: newConv, error: null }
  } catch (error) {
    console.error('Error getting or creating property conversation:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(userId, propertyId, title) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          property_id: propertyId,
          title: title || 'Conversation',
        },
      ])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating conversation:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get a conversation by ID
 */
export async function getConversationById(id) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting conversation by ID:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get all messages for a conversation, ordered by created_at ascending
 */
export async function getMessages(conversationId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting messages:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Add a new message to a conversation
 */
export async function addMessage(conversationId, role, content, metadata = null) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role,
          content,
          metadata,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error adding message:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update conversation updated_at timestamp
 */
export async function updateConversationTimestamp(conversationId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating conversation timestamp:', error)
    return { data: null, error: error.message }
  }
}
