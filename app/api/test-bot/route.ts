import { NextResponse } from 'next/server';
import { getBotResponse } from '@/lib/openai-bot';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const message = searchParams.get('message');

    if (!message) {
        return NextResponse.json({ error: 'Message required' });
    }

    const reply = await getBotResponse(message);
    return NextResponse.json({ input: message, reply });
}
