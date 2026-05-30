import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { embed } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Only PDF, DOCX, and TXT files are supported' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let content = ''

    if (ext === 'pdf') {
      // Dynamic import to avoid SSR issues
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(buffer)
      content = parsed.text
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      content = result.value
    } else {
      content = buffer.toString('utf-8')
    }

    content = content.trim()
    if (!content) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 422 })
    }

    // Generate embedding from first 8000 chars
    const embedding = await embed(content.slice(0, 8000))

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        filename: file.name,
        file_type: ext,
        content,
        embedding,
        metadata: {
          size_bytes: buffer.length,
          char_count: content.length,
        },
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await logAudit({
      action: 'document_uploaded',
      entity_type: 'document',
      entity_id: data.id,
      details: { filename: file.name, size_bytes: buffer.length, char_count: content.length },
    })

    return NextResponse.json({ document: data })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
