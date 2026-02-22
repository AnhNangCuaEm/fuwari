import { v4 as uuidv4 } from 'uuid'
import { query, queryOne } from './db'
import { ContactMessage, CreateContactMessageInput, ReplyContactMessageInput } from '@/types/contact'

export async function createContactMessage(
  input: CreateContactMessageInput
): Promise<ContactMessage> {
  const id = uuidv4()
  const result = await queryOne<ContactMessage>(
    `INSERT INTO contact_messages (id, name, email, phone, subject, message, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, input.name, input.email, input.phone || null, input.subject, input.message, input.user_id || null]
  )
  if (!result) throw new Error('Failed to create contact message')
  return result
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  return query<ContactMessage[]>(
    `SELECT * FROM contact_messages ORDER BY "createdAt" DESC`
  )
}

export async function getContactMessageById(id: string): Promise<ContactMessage | null> {
  return queryOne<ContactMessage>(
    `SELECT * FROM contact_messages WHERE id = $1`,
    [id]
  )
}

export async function replyToContactMessage(
  input: ReplyContactMessageInput
): Promise<ContactMessage | null> {
  return queryOne<ContactMessage>(
    `UPDATE contact_messages
     SET admin_reply = $1,
         replied_by  = $2,
         replied_at  = NOW(),
         status      = 'replied',
         "updatedAt" = NOW()
     WHERE id = $3
     RETURNING *`,
    [input.admin_reply, input.replied_by, input.id]
  )
}

export async function markContactAsReplied(id: string): Promise<ContactMessage | null> {
  return queryOne<ContactMessage>(
    `UPDATE contact_messages
     SET status = 'replied', "updatedAt" = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  )
}

export async function markContactAsPending(id: string): Promise<ContactMessage | null> {
  return queryOne<ContactMessage>(
    `UPDATE contact_messages
     SET status = 'pending', admin_reply = NULL, replied_at = NULL, replied_by = NULL, "updatedAt" = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  )
}

export async function getContactMessagesByEmail(email: string): Promise<ContactMessage[]> {
  return query<ContactMessage[]>(
    `SELECT * FROM contact_messages WHERE email = $1 ORDER BY "createdAt" DESC`,
    [email]
  )
}
