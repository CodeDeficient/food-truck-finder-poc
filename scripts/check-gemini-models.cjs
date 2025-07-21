require('dotenv').config({ path: '.env.local' });

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('No API key found!');
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Gemini Models:');
      data.models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
        if (model.description) {
          console.log(`  Description: ${model.description}`);
        }
      });
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkModels();
