import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagsParam = searchParams.get('tags');
    
    // Parse tags from query parameter or use defaults
    const geopoliticalTags = tagsParam && tagsParam.trim()
      ? tagsParam.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
      : ['geopolitics', 'politics', 'world'];

    const response = await fetch(
      'https://gamma-api.polymarket.com/events?closed=false'
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const events = await response.json();

    // Filter geopolitical and political events
    const filteredEvents = events
      .filter((event: any) => {
        if (!event.tags) return false;
        const eventTags = event.tags.map((tag: any) => tag.slug);
        return eventTags.some((tag: string) =>
          geopoliticalTags.includes(tag)
        );
      })
      .map((event: any) => {
        // Extract all market scenarios with their dates, filtering only active (not closed) ones
        const now = new Date();
        const scenarios = event.markets
          ?.filter((m: any) => {
            // Only include markets that end in the future (not closed)
            const marketEndDate = new Date(m.endDate);
            return marketEndDate > now;
          })
          .map((m: any) => ({
            question: m.question,
            endDate: m.endDate,
            volume: m.volume || m.volumeNum || 0,
          })) || [];

        // If no active scenarios, skip this event entirely
        if (scenarios.length === 0) {
          return null;
        }

        // Use the first active market for the main display
        const mainMarket = event.markets?.find((m: any) => m.question === scenarios[0].question);
        
        if (!mainMarket) {
          return null; // Skip events with no markets
        }
        
        // Parse outcomes if it's a string
        let outcomes = mainMarket.outcomes || [];
        if (typeof outcomes === 'string') {
          try {
            outcomes = JSON.parse(outcomes);
          } catch (e) {
            outcomes = [];
          }
        }
        
        // Parse outcomePrices - it's an object with numeric keys
        const outcomePricesRaw = mainMarket.outcomePrices || {};
        let outcomePricesArray: any[] = [];
        
        if (typeof outcomePricesRaw === 'string') {
          // Try to parse if it's a string
          try {
            const parsed = JSON.parse(outcomePricesRaw);
            if (Array.isArray(parsed)) {
              outcomePricesArray = parsed.map((price: any, idx: number) => ({
                outcome: outcomes[idx] || `Outcome ${idx + 1}`,
                price: typeof price === 'string' ? parseFloat(price) : price,
              }));
            }
          } catch (e) {
            // If parse fails, leave empty
          }
        } else if (typeof outcomePricesRaw === 'object') {
          // It's an object with numeric keys
          const keys = Object.keys(outcomePricesRaw)
            .map(Number)
            .filter(k => !isNaN(k))
            .sort((a, b) => a - b);
          
          outcomePricesArray = keys.map((idx: number) => ({
            outcome: outcomes[idx] || `Outcome ${idx + 1}`,
            price: parseFloat(outcomePricesRaw[idx]) || 0,
          }));
        }

        // Get the earliest market end date as the main display date (only from active markets)
        const earliestMarketDate = scenarios.reduce((earliest: string, scenario: any) => {
          return scenario.endDate < earliest ? scenario.endDate : earliest;
        }, scenarios[0].endDate);

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          tags: event.tags,
          active: event.active,
          startDate: event.startDate,
          endDate: earliestMarketDate,
          volume: event.volume,
          liquidity: event.liquidity,
          commentCount: event.commentCount,
          image: event.image,
          outcomes,
          outcomePrices: outcomePricesArray,
          scenarios,
        };
      })
      .filter((e: any) => e !== null);

    return NextResponse.json(filteredEvents);
  } catch (error) {
    console.error('Error fetching geopolitical events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
