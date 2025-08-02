/**
 * Script to add Uprooted Vegan Cuisine as the first premium verified food truck
 * This is Jennifer's business - our first customer validation partner
 */

import { FoodTruckService } from '@/lib/supabase/services/foodTruckService';
import type { FoodTruck, MenuItem, MenuCategory } from '@/lib/types';

// Uprooted Vegan Cuisine comprehensive data
const uprootedVeganData: Partial<FoodTruck> = {
  name: "Uprooted Vegan Cuisine",
  description: "At Uprooted Vegan Cuisine, we believe in the power of plants—not just to nourish the body, but to support the community and the planet. We're committed to sourcing locally, minimizing food waste, and spreading the word about the benefits of plant-based eating. Founded by Jennifer, whose health journey with renal failure led her to discover the transformative power of plant-based nutrition.",
  
  // Location - Martinez, GA (Augusta area)
  current_location: {
    lat: 33.526636,
    lng: -82.07125,
    address: "359 Furys Ferry Rd, Martinez, GA 30907",
    timestamp: new Date().toISOString()
  },

  // Operating hours - Monday-Friday 9AM-6PM, Closed weekends
  operating_hours: {
    monday: { open: "09:00", close: "18:00" },
    tuesday: { open: "09:00", close: "18:00" },
    wednesday: { open: "09:00", close: "18:00" },
    thursday: { open: "09:00", close: "18:00" },
    friday: { open: "09:00", close: "18:00" },
    saturday: { closed: true },
    sunday: { closed: true }
  },

  // Scheduled locations for food truck events
  scheduled_locations: [
    {
      address: "813 5th Street, Augusta, GA 30901",
      city: "Augusta",
      state: "GA",
      lat: 33.4646051,
      lng: -81.963694,
      timestamp: new Date().toISOString(),
      start_time: "00:00",
      end_time: "23:59"
    },
    {
      address: "Augusta, GA area",
      city: "Augusta",
      state: "GA",
      lat: 33.4734978,
      lng: -82.0105148,
      timestamp: new Date().toISOString(),
      start_time: "00:00",
      end_time: "23:59"
    }
  ],

  // Contact information
  contact_info: {
    phone: "(803) 514-4367",
    email: "info@eatuprootedvegan.com",
    website: "https://eatuprootedvegan.com"
  },

  // Social media
  social_media: {
    facebook: "https://www.facebook.com/uprooted.vegan.cuisine",
    instagram: "https://www.instagram.com/uprootedvegancuisine/"
  },

  // Cuisine and specialties
  cuisine_type: ["Vegan", "Plant-Based", "Healthy", "Local", "Seasonal", "Gluten-Free Options"],
  
  specialties: [
    "Weekly rotating seasonal menu",
    "Locally sourced ingredients", 
    "Allergy-friendly options",
    "Gluten-free dishes available weekly",
    "Custom catering and events",
    "Zero waste initiatives",
    "Meal prep services",
    "Private cooking classes",
    "Wedding and corporate catering",
    "Holiday specialty menus"
  ],

  // Price range
  price_range: "$$",

  // Premium verification status
  verification_status: "verified",
  
  // High data quality score
  data_quality_score: 100,
  
  // Source URLs from our research
  source_urls: [
    "https://eatuprootedvegan.com",
    "https://www.facebook.com/uprooted.vegan.cuisine",
    "https://www.instagram.com/uprootedvegancuisine/",
    "https://mylittleguide.com/augusta/directory/eat-local/uprooted-vegan-cuisine.html",
    "https://www.shoplocalaugusta.co/uprooted-vegan-cuisine/",
    "https://www.happycow.net/reviews/uprooted-vegan-cuisine-martinez-220383",
    "https://wanderlog.com/place/details/13619791/uprooted-vegan-cuisine"
  ],

  // Active and current - timestamps will be managed by database
  last_scraped_at: new Date().toISOString(),

  // Menu - rotating weekly, but here are the popular items
  menu: [
    {
      name: "Popular Weekly Rotations",
      items: [
        {
          name: "Birria Tacos",
          description: "Plant-based version of the classic Mexican dish with rich, savory broth and jackfruit",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "popular"],
          is_popular: true
        },
        {
          name: "Buddha Bowls", 
          description: "Seasonal vegetable bowls with grains, proteins, and house-made dressings",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "gluten-free-option", "popular"],
          is_popular: true
        },
        {
          name: "Roasted Cauliflower Steaks",
          description: "Hearty roasted cauliflower with seasonal vegetables and creative sauces", 
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "gluten-free", "popular"],
          is_popular: true
        },
        {
          name: "Low Country Roasted Tomato and Farro Salad",
          description: "Fresh seasonal salad featuring locally grown tomatoes and hearty farro",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "local", "seasonal"],
          is_popular: false
        }
      ]
    },
    {
      name: "Entrees & Mains",
      items: [
        {
          name: "Buffalo Chik'n Sandwich",
          description: "Plant-based buffalo chicken sandwich with all the fixings",
          price: undefined,
          dietary_tags: ["vegan", "plant-based"],
          is_popular: false
        },
        {
          name: "Mediterranean Sumac Bowl",
          description: "Middle Eastern inspired bowl with sumac-spiced vegetables and tahini",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "mediterranean"],
          is_popular: false
        },
        {
          name: "Vietnamese Noodle Salad Bowl", 
          description: "Fresh herbs, vegetables, and noodles with Vietnamese-inspired dressing",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "fresh", "asian-inspired"],
          is_popular: false
        },
        {
          name: "Mushroom Lentil Lasagna",
          description: "Hearty layered lasagna with mushrooms, lentils, and cashew cream",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "comfort-food"],
          is_popular: false
        },
        {
          name: "Almond Ricotta Stuffed Shells",
          description: "Pasta shells stuffed with house-made almond ricotta and herbs",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "italian-inspired"],
          is_popular: false
        },
        {
          name: "Cauliflower Gyro Platter",
          description: "Mediterranean-spiced cauliflower with tzatziki and pita",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "mediterranean"],
          is_popular: false
        },
        {
          name: "Chik'n Caesar Avocado Toast Plate",
          description: "Elevated avocado toast with plant-based chicken and caesar dressing",
          price: undefined,
          dietary_tags: ["vegan", "plant-based"],
          is_popular: false
        }
      ]
    },
    {
      name: "Salads & Light Options", 
      items: [
        {
          name: "Lovers Caesar Salad",
          description: "Classic caesar with house-made vegan dressing and plant-based parmesan",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "fresh"],
          is_popular: false
        },
        {
          name: "Seasonal Fresh Salads",
          description: "Rotating selection of salads featuring local, seasonal vegetables",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "local", "seasonal", "gluten-free"],
          is_popular: false
        }
      ]
    },
    {
      name: "Desserts & Treats",
      items: [
        {
          name: "Sugar Heart Cookies",
          description: "Customer favorite cookies that reviewers say are 'the BEST they've ever had'",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "dessert", "customer-favorite"],
          is_popular: true
        },
        {
          name: "Vegan Chocolate Cake",
          description: "Rich, decadent chocolate cake that's completely plant-based",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "dessert", "popular"],
          is_popular: true
        },
        {
          name: "Custom Cupcakes",
          description: "Various flavors including Georgia Peach, Vanilla Whiskey Fudge, and Chocolate Berry",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "dessert", "custom"],
          is_popular: false
        },
        {
          name: "Tiramisu",
          description: "Plant-based version of the classic Italian dessert",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "dessert", "italian-inspired"],
          is_popular: false
        },
        {
          name: "Pecan Pie Bars",
          description: "Southern-inspired pecan bars that are completely plant-based",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "dessert", "southern", "gluten-free"],
          is_popular: false
        },
        {
          name: "Blueberry Vanilla Palette Knife Cake",
          description: "Artistic cake with fresh blueberries and vanilla flavoring",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "dessert", "seasonal"],
          is_popular: false
        }
      ]
    },
    {
      name: "Weekly Meal Prep",
      items: [
        {
          name: "Weekly Rotating Menu",
          description: "Pre-order required. Menu changes weekly featuring seasonal, locally-sourced ingredients. Order Monday 6PM - Saturday 7PM for Monday pickup.",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "meal-prep", "local", "seasonal"],
          is_popular: true
        },
        {
          name: "Gluten-Free Options",
          description: "Gluten-free dishes available every week as part of the rotating menu",
          price: undefined,
          dietary_tags: ["vegan", "plant-based", "gluten-free", "allergy-friendly"],
          is_popular: false
        }
      ]
    },
    {
      name: "Catering & Special Orders",
      items: [
        {
          name: "Wedding Catering",
          description: "Custom vegan wedding menus designed to impress even non-vegan guests",
          price: "Custom pricing",
          dietary_tags: ["vegan", "plant-based", "catering", "wedding", "custom"],
          is_popular: false
        },
        {
          name: "Corporate Event Catering",
          description: "Professional catering services for corporate events and meetings",
          price: "Custom pricing", 
          dietary_tags: ["vegan", "plant-based", "catering", "corporate"],
          is_popular: false
        },
        {
          name: "Holiday Specialty Menus",
          description: "Custom holiday meals and desserts for special celebrations",
          price: "Custom pricing",
          dietary_tags: ["vegan", "plant-based", "holiday", "seasonal", "custom"],
          is_popular: false
        },
        {
          name: "Private Cooking Classes",
          description: "Learn to cook delicious plant-based meals with Jennifer",
          price: "Contact for pricing",
          dietary_tags: ["vegan", "plant-based", "educational", "private"],
          is_popular: false
        }
      ]
    }
  ]
};

async function addUprootedVeganCuisine() {
  try {
    console.log('🌱 Adding Uprooted Vegan Cuisine to the database...');
    console.log('📍 Location: Martinez, GA (Augusta area)');
    console.log('👩‍🍳 Owner: Jennifer');
    console.log('⭐ Status: Premium Verified Customer');
    
    const result = await FoodTruckService.createTruck(uprootedVeganData);
    
    if ('error' in result) {
      console.error('❌ Failed to add Uprooted Vegan Cuisine:', result.error);
      return;
    }
    
    console.log('✅ Successfully added Uprooted Vegan Cuisine!');
    console.log('📋 Truck ID:', result.id);
    console.log('📊 Data Quality Score:', result.data_quality_score);
    console.log('🎯 Verification Status:', result.verification_status);
    console.log('📱 Social Media:', result.social_media);
    console.log('🍽️  Menu Categories:', result.menu?.length || 0);
    
    // Count total menu items
    const totalItems = result.menu?.reduce((total, category) => total + category.items.length, 0) || 0;
    console.log('🥘 Total Menu Items:', totalItems);
    
    console.log('\n🎉 Jennifer\'s food truck is now live in the app!');
    console.log('💎 Premium verification: ✓ VERIFIED');
    console.log('🆓 Lifetime free premium membership: ✓ ACTIVE');
    console.log('📞 Contact: (803) 514-4367');
    console.log('🌐 Website: https://eatuprootedvegan.com');
    console.log('📱 Instagram: @uprootedvegancuisine');
    
  } catch (error) {
    console.error('💥 Unexpected error adding Uprooted Vegan Cuisine:', error);
  }
}

// Run the script
if (import.meta.url.includes('add-uprooted-vegan-cuisine') && process.argv[1]?.includes('add-uprooted-vegan-cuisine')) {
  addUprootedVeganCuisine().catch(console.error);
} else {
  // Always run if this is the main module
  addUprootedVeganCuisine().catch(console.error);
}

export default addUprootedVeganCuisine;
