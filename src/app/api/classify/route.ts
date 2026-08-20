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

    // Convert file to base64 for Gemini
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI assistant for a civic issue reporting system in India.
Look at this image and classify the civic issue into EXACTLY ONE of these three categories:
- "Sanitation (Garbage)" — garbage, waste, littering, dirty areas, overflowing bins, open dumping
- "Electrical (Streetlights)" — broken streetlights, electrical hazards, dark roads, exposed wires, power issues
- "PWD (Potholes/Roads)" — potholes, broken roads, damaged footpaths, road cave-ins, construction damage, waterlogging on roads

Reply with ONLY one of these three exact strings:
Sanitation (Garbage)
Electrical (Streetlights)
PWD (Potholes/Roads)

No other text. Just the category name.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
    ]);

    const rawResponse = result.response.text().trim();
    console.log('Gemini raw response:', rawResponse);

    // Fetch all departments from DB
    const { data: departments, error: dbError } = await supabase
      .from('departments')
      .select('*');

    if (dbError || !departments) {
      return NextResponse.json({ error: 'Could not fetch departments' }, { status: 500 });
    }

    // Find the matching department by checking if the response contains the dept name
    const matched = departments.find(dept =>
      rawResponse.toLowerCase().includes(dept.name.toLowerCase()) ||
      dept.name.toLowerCase().includes(rawResponse.toLowerCase())
    );

    if (matched) {
      return NextResponse.json({ department: matched, confidence: 'high' });
    }

    // Fallback: default to PWD if AI response doesn't match
    const fallback = departments.find(d => d.name.includes('PWD'));
    return NextResponse.json({ department: fallback || departments[0], confidence: 'low' });

  } catch (error: any) {
    console.error('Classification error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
