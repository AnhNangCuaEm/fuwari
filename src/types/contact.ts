export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  status: 'pending' | 'replied'
  admin_reply?: string | null
  replied_at?: string | null
  replied_by?: string | null
  user_id?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateContactMessageInput {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  user_id?: string | null
}

export interface ReplyContactMessageInput {
  id: string
  admin_reply: string
  replied_by: string
}
