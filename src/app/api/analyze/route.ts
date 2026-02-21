import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Build content array with images
    const content: any[] = [];
    
    for (const image of images) {
      // image is base64 string, detect media type
      let mediaType = 'image/jpeg';
      if (image.startsWith('data:')) {
        const match = image.match(/^data:(image\/\w+);base64,/);
        if (match) {
          mediaType = match[1];
        }
        // Strip data URL prefix
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          },
        });
      } else {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: image,
          },
        });
      }
    }

    content.push({
      type: 'text',
      text: 'Analyze this food image for someone managing gout. Provide your response as JSON.',
    });

    const systemPrompt = `You are a specialized nutrition analyst for gout patients. Analyze food images and provide detailed purine content information.

For each food image, identify ALL foods visible and provide:

1. "foods": array of food names detected
2. "purineLevel": overall classification - "low" (<100mg/100g), "moderate" (100-200mg), "high" (200-300mg), or "very-high" (>300mg)
3. "estimatedPurine": estimated total purine content in mg for a typical serving
4. "explanation": 2-3 sentences explaining why this food is good or bad for gout sufferers. Be specific about which ingredients contribute most to purine content.
5. "alternatives": array of 3-5 safer lower-purine alternatives if the food is moderate or high purine. Empty array if already low.
6. "safetyDuringFlare": one sentence about whether this food is safe during an active gout flare
7. "riskFactors": array of specific risk factors (e.g., "High in organ meat purines", "Contains shellfish", "Beer inhibits uric acid excretion")
8. "benefits": array of benefits if any (e.g., "Rich in vitamin C which may lower uric acid", "Low-fat dairy is associated with lower gout risk", "Cherries have anti-inflammatory properties")

HIGH-RISK foods to flag: organ meats (liver, kidney), shellfish (mussels, shrimp, lobster), red meat, beer, anchovies, sardines, herring, mackerel, high-fructose corn syrup, yeast extract, game meats.

BENEFICIAL foods to highlight: cherries, low-fat dairy, most vegetables, whole grains, coffee, vitamin C rich foods, water.

Return ONLY valid JSON with the exact structure above. No markdown code fences.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    });

    const textBlock = response.content.find((block: any) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(textBlock.text);
    } catch {
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
