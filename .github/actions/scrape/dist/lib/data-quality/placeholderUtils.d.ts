/**
* Returns an array of regular expressions that identify placeholder patterns.
* @example
* getPlaceholderPatterns()
* [ /undefined/i, /placeholder/i, /example\.com/i, /test\s*truck/i, /lorem\s*ipsum/i, /\bna\b/i, /\bn\/a\b/i, /^0+$/, /^null$/i ]
* @returns {RegExp[]} An array of regular expressions to match various placeholder values.
* @description
*   - Regular expressions cover common placeholder values used in data.
*   - Patterns are designed to be case insensitive to support a wider range of inputs.
*   - Contains specific patterns like 'example.com' to catch domain placeholders.
*   - Includes matches for numeric placeholders like '000...' and 'null'.
*/
export declare function getPlaceholderPatterns(): RegExp[];
/**
* Checks the food truck's properties for placeholder patterns and sets them to undefined if a pattern is found.
* @example
* checkForPlaceholders(foodTruckObj, [/\b(?:N\/A|TBD|Unknown)\b/, /^{.+}$/])
* {name: undefined, description: undefined}
* @param {FoodTruck} truck - The food truck object which may contain placeholder text in its properties.
* @param {RegExp[]} patterns - Array of regex patterns used to test against food truck properties.
* @returns {Partial<FoodTruck>} A partial food truck object with properties set to undefined if placeholders are detected.
* @description
*   - The function does not modify the original truck object; it returns a new one.
*   - Handles undefined properties seamlessly to prevent errors during regex testing.
*   - Assumes that the RegExp provided will effectively identify placeholder patterns.
*/
export declare function checkForPlaceholders(truck: FoodTruck, patterns: RegExp[]): Partial<FoodTruck>;
/**
* Processes a FoodTruck object for placeholders and returns updates.
* @example
* processTruckForPlaceholders(truck, [/pattern1/g, /pattern2/g])
* { name: 'Updated Truck Name', address: 'Updated Address' }
* @param {FoodTruck} truck - The FoodTruck object to be processed for placeholders.
* @param {Array<RegExp>} patterns - Array of regular expressions to identify placeholders.
* @returns {Partial<FoodTruck>} An object containing the updated fields of the FoodTruck.
* @description
*   - Performs checks for placeholders in basic information of the truck.
*   - Processes contact information of the FoodTruck for placeholders.
*   - Assesses and updates address details for placeholders.
*   - Combines updates from basic, contact, and address information into a single object.
*/
export declare function processTruckForPlaceholders(truck: FoodTruck, patterns: RegExp[]): Partial<FoodTruck>;
