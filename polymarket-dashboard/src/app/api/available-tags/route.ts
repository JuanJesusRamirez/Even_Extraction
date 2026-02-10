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

    // Collect all unique tags from all events
    const tagsMap = new Map<string, number>();
    
    events.forEach((event: any) => {
      event.tags?.forEach((tag: any) => {
        const slug = tag.slug.toLowerCase();
        tagsMap.set(slug, (tagsMap.get(slug) || 0) + 1);
      });
    });

    // Convert to array and sort by frequency
    const tags = Array.from(tagsMap, ([slug, count]) => ({
      slug,
      count,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalEvents: events.length,
      uniqueTags: tags.length,
      tags: tags.slice(0, 50), // Top 50 tags
    });
  } catch (error) {
    console.error('Error fetching available tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available tags' },
      { status: 500 }
    );
  }
}
