'use server'

import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    return { error: error.message }
  }

  // Yahan se redirect nahi karenge, bas success signal bhejenge
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { full_name: fullName }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
