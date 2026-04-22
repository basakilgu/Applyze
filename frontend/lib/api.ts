import { supabase } from './supabase'

export async function sayHello(name?: string) {
  const { data, error } = await supabase.functions.invoke('hello', {
    body: { name },
  })
  if (error) throw error
  return data
}