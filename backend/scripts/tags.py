import requests
import json

slug = "ukraine"
url = f"https://gamma-api.polymarket.com/tags/slug/{slug}"
response = requests.get(url)

data = response.json()
with open("tag.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)