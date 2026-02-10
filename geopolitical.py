import requests

import json

import os

url = "https://gamma-api.polymarket.com/events"

r = requests.get("https://gamma-api.polymarket.com/events?closed=false")

response = r.json()

# Filter events based on specific criteria

for event in response:

    # Example filters - you can modify these based on your needs

    # Filter by specific tags (e.g., geopolitics, politics)

    if 'tags' in event:

        geopolitical_tags = ['geopolitics', 'politics']

        event_tags = [tag['slug'] for tag in event['tags']]

        if any(tag in geopolitical_tags for tag in event_tags):

            print(f"Title: {event.get('title', 'N/A')}")

            print(f"Tags: {[tag['label'] for tag in event['tags']]}")

            print(f"Active: {event.get('active', 'N/A')}")

            #print(event.get('description', 'No description available'))

            market_list=event['markets']

            print(f"Number of markets: {len(market_list)}")

            market_dict=event['markets'][0]

            print(f"Outcomes : {market_dict.get('outcomes', 'N/A')}")

            print(f"Outcome Prices: {market_dict.get('outcomePrices', 'N/A')}")

            print(market_dict)

            print("-" * 50)
 