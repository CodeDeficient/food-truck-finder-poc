export const PromptTemplates = {
  menuProcessing: (rawMenuText: string) => `
Parse the following food truck menu text and return a structured JSON format.
Extract menu items with categories, names, descriptions, prices, and dietary tags.

Menu text:
${rawMenuText}

Expected JSON format:
[
  {
    "category": "string",
    "items": [
      {
        "name": "string",
        "description": "string",
        "price": number,
        "dietary_tags": ["string"]
      }
    ]
  }
]

Rules:
- Extract actual prices as numbers (e.g., 12.99, not "$12.99")
- Include dietary restrictions and special tags
- Group items into logical categories
- If no clear categories, use "Main Items"
- Return only the json, no additional text
  `,

  locationExtraction: (textInput: string) => `
Extract location information from the following text and return structured data.
Look for addresses, cross streets, landmarks, or location descriptions.

Text:
${textInput}

Expected JSON format:
{
  "address": "string or undefined",
  "city": "string or undefined", 
  "state": "string or undefined",
  "zipCode": "string or undefined",
  "coordinates": {"lat": number, "lng": number} or undefined,
  "confidence": number,
  "landmarks": ["string"]
}

Rules:
- Set coordinates to undefined if not explicitly provided
- Confidence should be 0.0 to 1.0 based on clarity
- Include any mentioned landmarks or cross streets
- Return only the json, no additional text
  `,

  operatingHours: (hoursText: string) => `
Parse the following operating hours text and return standardized format.
Convert all times to 24-hour format and handle various input formats.

Hours text:
${hoursText}

Expected JSON format:
{
  "monday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "tuesday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "wednesday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "thursday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "friday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "saturday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "sunday": {"open": "HH:MM", "close": "HH:MM", "closed": false}
}

Rules:
- Use 24-hour format (e.g., "14:30" for 2:30 pm)
- If closed on a day, set "closed": true and omit open/close times
- Handle ranges like "Mon-Fri" by applying to all days in range
- Default to reasonable hours if ambiguous
- Return only the json, no additional text
  `,

  sentimentAnalysis: (reviewText: string) => `
Analyze the sentiment of this food truck review and extract key insights.
Focus on food quality, service, value, and overall experience.

Review text:
${reviewText}

Expected JSON format:
{
  "score": number,
  "confidence": number,
  "aspects": {
    "food_quality": number,
    "service": number,
    "value": number,
    "overall": number
  },
  "summary": "string",
  "keywords": ["string"]
}

Rules:
- Score should be 0.0 (very negative) to 1.0 (very positive)
- Confidence should be 0.0 to 1.0 based on clarity of sentiment
- Include specific aspects mentioned in the review
- Summary should be 1-2 sentences max
- Return only the json, no additional text
  `,

  dataEnhancement: (rawData: unknown) => `
Enhance and standardize the following food truck data.
Fill in missing information where possible and improve data quality.

Raw data:
${JSON.stringify(rawData, undefined, 2)}

Expected JSON format:
{
  "name": "string",
  "description": "string",
  "cuisine_type": "string",
  "price_range": "$ | $$ | $$$ | $$$$",
  "contact": {
    "phone": "string",
    "email": "string",
    "website": "string",
    "social_media": {}
  },
  "location": {
    "address": "string",
    "city": "string",
    "state": "string",
    "coordinates": {"lat": number, "lng": number}
  },
  "operating_hours": {},
  "menu_categories": ["string"],
  "specialties": ["string"],
  "dietary_options": ["string"]
}

Rules:
- Preserve all original data while enhancing it
- Standardize naming conventions
- Infer cuisine type from menu items
- Estimate price range from menu prices
- Return only the json, no additional text
  `,

  _foodTruckExtractionSchema: `
Expected JSON schema:
{
  "name": "string (food truck name)",
  "description": "string (brief description of the food truck)",
  "cuisine_type": "string (type of cuisine served)",
  "contact": {
    "phone": "string (phone number if found)",
    "email": "string (email if found)", 
    "website": "string (website URL if found)",
    "social_media": {
      "facebook": "string (Facebook URL if found)",
      "instagram": "string (Instagram URL if found)",
      "twitter": "string (Twitter URL if found)"
    }
  },
  "location": {
    "address": "string (physical address if found)",
    "city": "string (city name)",
    "state": "string (state abbreviation)",
    "coordinates": {
      "lat": "number (latitude if found)",
      "lng": "number (longitude if found)"
    }
  },
  "operating_hours": {
    "monday": {"open": "string (HH:MM)", "close": "string (HH:MM)", "closed": "boolean"},
    "tuesday": {"open": "string (HH:MM)", "close": "string (HH:MM)", "closed": "boolean"},
    "wednesday": {"open": "string (HH:MM)", "close": "string (HH:MM)", "closed": "boolean"},
    "thursday": {"open": "string (HH:MM)", "close": "string (HH:MM)", "closed": "boolean"},
    "friday": {"open": "string (HH:MM)", "close": "string (HH:MM)", "closed": "boolean"},
    "saturday": {"open": "string (HH:MM)", "close": "string (HH:MM)", "closed": "boolean"},
    "sunday": {"open": "string (HH:MM)", "close": "string (HH:MM)", "closed": "boolean"}
  },
  "menu": [
    {
      "category": "string (menu category)",
      "items": [
        {
          "name": "string (item name)",
          "description": "string (item description)",
          "price": "number (price as number, not string)",
          "dietary_tags": ["string (dietary restrictions/tags)"]
        }
      ]
    }
  ],
  "specialties": ["string (signature dishes or specialties)"],
  "dietary_options": ["string (dietary accommodations like vegan, gluten-free)"],
  "price_range": "string ($ for under $10, $$ for $10-20, $$$ for $20-30, $$$$ for over $30)"
}
`,

  _foodTruckExtractionInstructions: `
Instructions:
- Extract as much information as possible from the provided content
- If information is not available, use null for the field
- For operating hours, use 24-hour format (e.g., "14:30" for 2:30 PM)
- If a day is closed, set "closed": true and omit open/close times
- For prices, extract numeric values only (e.g., 12.99, not "$12.99")
- Be thorough in extracting menu items and their details
- Look for social media links and contact information carefully
- Return only the JSON object, no additional text or formatting
`,

  foodTruckExtraction(markdownContent: string, sourceUrl?: string) {
    return `
You are an ai assistant tasked with extracting structured information about food trucks from their website content (provided in Markdown format). Your goal is to populate a json object with the following schema. Only return the json object, nothing else.

Website content:
${markdownContent}

${sourceUrl ? `Source URL: ${sourceUrl}` : ''}

${this._foodTruckExtractionSchema}

${this._foodTruckExtractionInstructions}
`;
  }
};
