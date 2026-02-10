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
    const now = new Date();

    const geopoliticalTags = ['geopolitics', 'politics'];
    const sampleEvent = events.find((event: any) => {
      if (!event.tags) return false;
      const eventTags = event.tags.map((tag: any) => tag.slug);
      return eventTags.some((tag: string) =>
        geopoliticalTags.includes(tag)
      );
    });

    if (!sampleEvent) {
      return NextResponse.json({ error: 'No geopolitical events found' });
    }

    const scenarios = sampleEvent.markets
      ?.filter((m: any) => {
        const marketEndDate = new Date(m.endDate);
        return marketEndDate > now;
      })
      .map((m: any) => ({
        question: m.question,
        endDate: m.endDate,
        endDateParsed: new Date(m.endDate),
        isFuture: new Date(m.endDate) > now,
      })) || [];

    const allMarkets = sampleEvent.markets?.map((m: any) => ({
      question: m.question,
      endDate: m.endDate,
      endDateParsed: new Date(m.endDate),
      isFuture: new Date(m.endDate) > now,
    })) || [];

    return NextResponse.json({
      now,
      title: sampleEvent.title,
      filteredScenarios: scenarios.length,
      allMarkets: allMarkets.length,
      scenarios,
      allMarkets,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
