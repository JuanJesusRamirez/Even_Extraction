import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://gamma-api.polymarket.com/events?closed=false'
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const events = await response.json();

    // Get first event with geopolitical tag to see structure
    const geopoliticalTags = ['geopolitics', 'politics', 'world'];
    const sampleEvent = events.find((event: any) => {
      if (!event.tags) return false;
      const eventTags = event.tags.map((tag: any) => tag.slug);
      return eventTags.some((tag: string) =>
        geopoliticalTags.includes(tag)
      );
    });

    if (!sampleEvent) {
      return NextResponse.json({
        error: 'No geopolitical events found',
        totalEvents: events.length,
      });
    }

    return NextResponse.json({
      sampleEvent,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
