import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Map AI response to department names in our DB
const DEPARTMENT_MAP: Record<string, string> = {
  'Sanitation (Garbage)': 'Sanitation (Garbage)',
  'Electrical (Streetlights)': 'Electrical (Streetlights)',
  'PWD (Potholes/Roads)': 'PWD (Potholes/Roads)',
};

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
    const mimeType = imageFile.type;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI assistant for a civic issue reporting system in India. 
    Look at this image and classify the civic issue into EXACTLY ONE of these three departments:
    - "Sanitation (Garbage)" — for garbage, waste, littering, dirty areas, overflowing bins
    - "Electrical (Streetlights)" — for broken streetlights, electrical hazards, dark roads, exposed wires
    - "PWD (Potholes/Roads)" — for potholes, broken roads, damaged footpaths, road cave-ins, construction damage
    
    Reply with ONLY the department name, nothing else. No explanation. No punctuation. Just the exact department name from the list above.`;

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

    // Find the matching department
    const matchedDept = Object.keys(DEPARTMENT_MAP).find(dept =>
      rawResponse.toLowerCase().includes(dept.toLowerCase())
    );

    if (!matchedDept) {
      // Default fallback to PWD if AI can't classify
      return NextResponse.json({ department: 'PWD (Potholes/Roads)', confidence: 'low' });
    }

    return NextResponse.json({ department: matchedDept, confidence: 'high' });
  } catch (error: any) {
    console.error('Gemini classification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
