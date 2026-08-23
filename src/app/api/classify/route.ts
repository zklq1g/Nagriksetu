import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const DEPARTMENTS = [
  { id: "a65c2b53-7cad-46ef-a0e9-4d91d8dae3b8", name: "Sanitation (Garbage)", sla_hours: 24, color: "#ef4444" },
  { id: "6c832e05-48d6-48c5-a819-d7b459df440d", name: "Electrical (Streetlights)", sla_hours: 48, color: "#f59e0b" },
  { id: "bd527a62-e673-452d-b0db-f3160190727b", name: "PWD (Potholes/Roads)", sla_hours: 168, color: "#3b82f6" }
];

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

    const departments = DEPARTMENTS;

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
