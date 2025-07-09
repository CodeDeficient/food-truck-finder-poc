const fs = require('fs');

const filePath = 'C:/AI/food-truck-finder-poc/components/trucks/TruckCardContent.tsx';

try {
  fs.unlinkSync(filePath);
  console.log(`Successfully deleted ${filePath}`);
} catch (e) {
  console.error(`Error deleting ${filePath}:`, e);
}