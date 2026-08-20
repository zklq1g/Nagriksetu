import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">NagrikSetu Database Check</h1>
      <ul>
        {todos?.map((todo: any) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
        {!todos && <li>No data or could not connect to Supabase.</li>}
        {todos?.length === 0 && <li>Connected! But no todos found.</li>}
      </ul>
    </main>
  )
}
