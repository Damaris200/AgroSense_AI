# AgroSense AI fine-tuning data instructions (paste into Claude)

You are generating a JSONL dataset for fine-tuning a chat model to produce farming recommendations for AgroSense AI.

## Project context (for you, the generator)
AgroSense AI is an event-driven platform. The AI service receives an `analysis.ready` event that includes:
- `cropType`, `location`
- `weather`: `temperature` (C), `humidity` (%), `rainfall` (mm), `description`
- `soil`: `pH`, `moisture` (%), `nitrogen` (mg/kg), `phosphorus` (mg/kg), `potassium` (mg/kg)

The AI must return a recommendation as 3-5 sentences in simple, actionable language. It must cover:
1) whether conditions are suitable for planting the crop
2) one concrete action to take now
3) one warning or risk to watch for

## Output format (STRICT)
- Output ONLY JSONL (one JSON object per line)
- Each line is a simple input/output pair:

{"input":"Generate a concise farming recommendation using the data below.\n{\n  \"cropType\": \"maize\",\n  \"location\": \"Kisumu, Kenya\",\n  \"weather\": {\"temperature\": 27, \"humidity\": 68, \"rainfall\": 8, \"description\": \"partly cloudy\"},\n  \"soil\": {\"pH\": 6.4, \"moisture\": 38, \"nitrogen\": 120, \"phosphorus\": 28, \"potassium\": 150}\n}\n","output":"..."}

## Required constraints
- 3 to 5 sentences per recommendation
- Simple, practical language; no jargon
- Mention the crop and location in the recommendation
- Include exactly one immediate action and one warning/risk
- Avoid medical, legal, or financial advice
- Do not include any extra text outside JSONL
- Do not include markdown
- Do not include code fences

## Data realism guidelines
- Temperature: 15-38 C
- Humidity: 30-95%
- Rainfall: 0-60 mm
- Soil pH: 4.5-8.0
- Soil moisture: 10-70%
- N/P/K: 10-300 mg/kg
- Weather descriptions should be short phrases (e.g., "clear", "light rain", "overcast")
- Locations should be African cities or farming regions

## Coverage goals
- Include at least 20% low-rainfall cases (0-5 mm)
- Include at least 15% heavy-rainfall cases (30+ mm)
- Include at least 15% low-pH cases (<5.5)
- Include at least 15% high-pH cases (>7.2)
- Include a mix of crops (maize, cassava, beans, sorghum, rice, millet, groundnut, yam, cowpea, soybean, sweet potato, tomato, onion, chili pepper, banana, coffee, cocoa, tea)
- Include a mix of regions (Kenya, Nigeria, Ghana, Tanzania, Uganda, Rwanda, Ethiopia, Cameroon, Zambia, Malawi, Senegal, Mali, Niger, Benin, Togo, Cote d'Ivoire, South Africa, Morocco)

## How many records to generate
Generate 250 JSONL lines.

## Seed examples (follow this style)
{"input":"Generate a concise farming recommendation using the data below.\n{\n  \"cropType\": \"maize\",\n  \"location\": \"Eldoret, Kenya\",\n  \"weather\": {\"temperature\": 24, \"humidity\": 70, \"rainfall\": 6, \"description\": \"cloudy\"},\n  \"soil\": {\"pH\": 6.3, \"moisture\": 42, \"nitrogen\": 130, \"phosphorus\": 26, \"potassium\": 160}\n}\n","output":"Conditions in Eldoret are generally suitable for maize planting given the mild temperature and moderate moisture. Plant now and incorporate a small dose of nitrogen-rich fertilizer into the topsoil to boost early growth. Keep an eye on extended cloudy spells, as low sunlight can slow germination if soils stay too cool."}
{"input":"Generate a concise farming recommendation using the data below.\n{\n  \"cropType\": \"cassava\",\n  \"location\": \"Ibadan, Nigeria\",\n  \"weather\": {\"temperature\": 31, \"humidity\": 80, \"rainfall\": 34, \"description\": \"heavy rain\"},\n  \"soil\": {\"pH\": 5.1, \"moisture\": 62, \"nitrogen\": 90, \"phosphorus\": 20, \"potassium\": 140}\n}\n","output":"Cassava can grow in Ibadan right now, but the soil is slightly acidic and very wet. Delay planting for a few days and mound the beds higher to improve drainage before you set cuttings. Watch for waterlogging after heavy rains, which can rot young stems."}
{"input":"Generate a concise farming recommendation using the data below.\n{\n  \"cropType\": \"beans\",\n  \"location\": \"Gitega, Burundi\",\n  \"weather\": {\"temperature\": 19, \"humidity\": 55, \"rainfall\": 2, \"description\": \"clear\"},\n  \"soil\": {\"pH\": 7.4, \"moisture\": 18, \"nitrogen\": 110, \"phosphorus\": 24, \"potassium\": 130}\n}\n","output":"Current conditions in Gitega are only marginal for beans because the soil is dry and slightly alkaline. Water the field and add organic matter before planting to help retain moisture and balance pH. Watch for poor germination if the dry weather continues for another week."}
{"input":"Generate a concise farming recommendation using the data below.\n{\n  \"cropType\": \"rice\",\n  \"location\": \"Bamako, Mali\",\n  \"weather\": {\"temperature\": 35, \"humidity\": 40, \"rainfall\": 0, \"description\": \"hot and dry\"},\n  \"soil\": {\"pH\": 6.0, \"moisture\": 16, \"nitrogen\": 140, \"phosphorus\": 30, \"potassium\": 190}\n}\n","output":"Conditions in Bamako are not ideal for rice planting because it is too hot and dry. Irrigate and establish standing water before planting so seedlings do not dry out. Watch for heat stress if temperatures stay above 34 C during the first two weeks."}
{"input":"Generate a concise farming recommendation using the data below.\n{\n  \"cropType\": \"sorghum\",\n  \"location\": \"Dodoma, Tanzania\",\n  \"weather\": {\"temperature\": 29, \"humidity\": 48, \"rainfall\": 12, \"description\": \"light rain\"},\n  \"soil\": {\"pH\": 6.8, \"moisture\": 36, \"nitrogen\": 85, \"phosphorus\": 18, \"potassium\": 120}\n}\n","output":"Dodoma has favorable conditions for sorghum with warm temperatures and light rain. Plant now and add a small dose of phosphorus fertilizer to support early root growth. Watch for nutrient stress if leaves turn pale, as soil nitrogen is on the low side."}
