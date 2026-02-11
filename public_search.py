import requests
import json
import os

query = "colombia"
url = f"https://gamma-api.polymarket.com/public-search?search_tags=true&q={query}"

response = requests.get(url)

data = response.json()

out_path = os.path.join(os.path.dirname(__file__), "results_colombia_elections.json")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Saved to {out_path}")

#elections, global-elections, politics, geopolitics, world