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

    // Filter geopolitical and political events
    const geopoliticalTags = ['geopolitics', 'politics'];
    const filteredEvents = events
      .filter((event: any) => {
        if (!event.tags) return false;
        const eventTags = event.tags.map((tag: any) => tag.slug);
        return eventTags.some((tag: string) =>
          geopoliticalTags.includes(tag)
        );
      })
      .map((event: any) => {
        const market = event.markets?.[0];
        const outcomePrices = market?.outcomePrices || [];
        
        // Handle both array and object formats for outcomePrices
        let outcomePricesArray: any[] = [];
        
        if (Array.isArray(outcomePrices)) {
          // If it's already an array
          outcomePricesArray = outcomePrices.map((price: any, idx: number) => ({
            outcome: market?.outcomes?.[idx] || `Outcome ${idx + 1}`,
            price: typeof price === 'number' ? price : 0,
          }));
        } else if (typeof outcomePrices === 'object' && outcomePrices !== null) {
          // If it's an object, convert to array
          outcomePricesArray = Object.entries(outcomePrices).map(
            ([outcome, price]: [string, any]) => ({
              outcome,
              price: typeof price === 'number' ? price : 0,
            })
          );
        }

        console.log('Market ID:', market?.id);
        console.log('Outcomes:', market?.outcomes);
        console.log('OutcomePrices (raw):', market?.outcomePrices);
        console.log('OutcomePrices (processed):', outcomePricesArray);

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          tags: event.tags,
          active: event.active,
          markets: event.markets,
          outcomes: market?.outcomes || [],
          outcomePrices: outcomePricesArray,
        };
      });

    return NextResponse.json(filteredEvents);
  } catch (error) {
    console.error('Error fetching geopolitical events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
