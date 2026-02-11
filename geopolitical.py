import requests
import json
import os

url = "https://gamma-api.polymarket.com/events"

r = requests.get(url + "?closed=false")

response = r.json()

# Collect filtered events and save to JSON
results = []

# Tags to filter by
geopolitical_tags = ['trump']

for event in response:
    if 'tags' in event:
        event_tags = [tag.get('slug') for tag in event.get('tags', [])]
        if any(tag in geopolitical_tags for tag in event_tags):
            title = event.get('title', 'N/A')
            tags = [tag.get('label') for tag in event.get('tags', [])]
            active = event.get('active')
            markets = event.get('markets', [])
            markets_count = len(markets)
            first_market = markets[0] if markets else {}
            outcomes = first_market.get('outcomes')
            outcome_prices = first_market.get('outcomePrices')
            market_dict = first_market

            # Append structured result
            results.append({
                'id': event.get('id'),
                'title': title,
                'tags': tags,
                'active': active,
                'markets_count': markets_count,
                'first_market': {
                    'outcomes': outcomes,
                    'outcomePrices': outcome_prices,
                    'market': market_dict
                },
                'raw_event': event
            })

            # Keep printing for quick feedback
            print(f"Title: {title}")
            print(f"Tags: {tags}")
            print(f"Active: {active}")
            print(f"Number of markets: {markets_count}")
            print(f"Outcomes : {outcomes}")
            print(f"Outcome Prices: {outcome_prices}")
            print("-" * 50)

# Write results to JSON file next to this script
out_path = os.path.join(os.path.dirname(__file__), "results.json")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Saved {len(results)} events to {out_path}")
