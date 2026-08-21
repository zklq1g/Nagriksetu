import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are an AI assistant for a civic issue reporting system in India.
Look at this image and classify the civic issue into EXACTLY ONE of these three categories:
- "Sanitation (Garbage)"
- "Electrical (Streetlights)"
- "PWD (Potholes/Roads)"

Also, determine a severity score from 1 to 100 based on the visual damage or hazard level.

Respond ONLY with a valid JSON object in this exact format:
{
  "category": "category name here",
  "severity": 85
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
    ]);

    const rawResponse = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (e) {
      parsed = { category: rawResponse, severity: 50 }; // fallback
    }

    // Fetch all departments from DB
    const { data: departments, error: dbError } = await supabase
      .from('departments')
      .select('*');

    if (dbError || !departments) {
      return NextResponse.json({ error: 'Could not fetch departments' }, { status: 500 });
    }

    const matched = departments.find(dept =>
      parsed.category.toLowerCase().includes(dept.name.toLowerCase()) ||
      dept.name.toLowerCase().includes(parsed.category.toLowerCase())
    );

    if (matched) {
      return NextResponse.json({ department: matched, severity: parsed.severity, confidence: 'high' });
    }

    const fallback = departments.find(d => d.name.includes('PWD'));
    return NextResponse.json({ department: fallback || departments[0], severity: parsed.severity || 50, confidence: 'low' });

  } catch (error: any) {
    console.error('Classification error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
