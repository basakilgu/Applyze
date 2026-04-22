import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const body = await req.json().catch(() => ({}))
  const name = body.name?.trim() || 'Applyze'

  const payload = {
    message: `Merhaba ${name} — backend ayakta.`,
    service: 'applyze-backend',
    timestamp: new Date().toISOString(),
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})