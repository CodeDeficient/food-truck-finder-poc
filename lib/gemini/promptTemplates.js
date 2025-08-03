export const PromptTemplates = {
    menuProcessing: (rawMenuText) => `
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
    locationExtraction: (textInput) => `
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
    operatingHours: (hoursText) => `
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
    sentimentAnalysis: (reviewText) => `
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
    dataEnhancement: (rawData) => `
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
    foodTruckExtraction: (markdownContent, sourceUrl) => {
        return `
You are an AI assistant tasked with extracting structured information about food trucks from their website content (provided in Markdown format). 

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object that matches the exact schema provided below
- Do not include any additional text, explanations, or markdown formatting
- Do not wrap the JSON in code blocks or backticks
- If you cannot confidently extract a real food truck name, return: {"name": null}
- Ensure all JSON strings are properly escaped with double quotes
- Use double quotes for all string values, never single quotes
- Escape special characters properly (backslashes, quotes, etc.)
- Do not include any control characters or invalid Unicode sequences

Expected JSON format:
{
  "name": "string or null",
  "description": "string or null",
  "cuisine_type": ["string"] or null,
  "contact_info": {
    "phone": "string or null",
    "email": "string or null", 
    "website": "string or null",
    "social_media": {
      "facebook": "string or null",
      "instagram": "string or null",
      "twitter": "string or null"
    }
  },
  "operating_hours": {
    "monday": {
      "open": "string or null",
      "close": "string or null", 
      "closed": true or false
    },
    "tuesday": {
      "open": "string or null",
      "close": "string or null",
      "closed": true or false
    },
    "wednesday": {
      "open": "string or null", 
      "close": "string or null",
      "closed": true or false
    },
    "thursday": {
      "open": "string or null",
      "close": "string or null", 
      "closed": true or false
    },
    "friday": {
      "open": "string or null",
      "close": "string or null",
      "closed": true or false
    },
    "saturday": {
      "open": "string or null",
      "close": "string or null", 
      "closed": true or false
    },
    "sunday": {
      "open": "string or null",
      "close": "string or null",
      "closed": true or false
    }
  },
  "menu": [
    {
      "category": "string",
      "items": [
        {
          "name": "string",
          "description": "string or null",
          "price": number or null,
          "dietary_tags": ["string"] or null
        }
      ]
    }
  ]
}

Website content:
${markdownContent}

${sourceUrl ? `Source URL: ${sourceUrl}` : ''}

Extraction Instructions:
1. Extract as much information as possible from the provided content
2. For missing information, use null values (not empty strings or objects)
3. For operating hours, use 24-hour format (e.g., "14:30" for 2:30 PM)
4. If a day is closed, set "closed": true and use null for open/close times
5. For prices, extract numeric values only (e.g., 12.99, not "$12.99")
6. Be thorough in extracting menu items and their details
7. Look for social media links and contact information carefully
8. CRITICAL: If you cannot confidently extract a real food truck name, return {"name": null}
9. CRITICAL: Return ONLY the JSON object, nothing else
10. CRITICAL: Ensure all JSON is properly formatted with correct escaping
11. CRITICAL: Double-check that your JSON is valid before returning
12. CRITICAL: Use double quotes for all string values, never single quotes
13. CRITICAL: Escape special characters properly (backslashes, quotes, etc.)
14. CRITICAL: Do not include any control characters or invalid Unicode sequences
`;
    },
};
