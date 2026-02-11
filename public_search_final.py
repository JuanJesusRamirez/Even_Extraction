import requests
import json
from urllib.parse import urlencode

query = "colombia"
search_tags = "true"
#events_tag = [ "politics","geopolitics", "elections", "economy", "economy-policy","Global-Rates"]  # Lista de tags
events_tag ="Global-Rates"
params = {
    "search_tags": search_tags,
    "q": query,
    "events_tag": events_tag
}

# urlencode con doseq=True genera: events_tag=elections&events_tag=politics
query_string = urlencode(params, doseq=True)
url = f"https://gamma-api.polymarket.com/public-search?{query_string}"

response = requests.get(url)
data = response.json()

with open("test.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Guardado en test.json")