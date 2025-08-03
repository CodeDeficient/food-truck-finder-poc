import type { FoodTruck } from '@/lib/types';

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
export function getPlaceholderPatterns(): RegExp[] {
  return [
    /undefined/i,
    /placeholder/i,
    /example\.com/i,
    /test\s*truck/i,
    /lorem\s*ipsum/i,
    /\bna\b/i,
    /\bn\/a\b/i,
    /^0+$/,
    /^null$/i,
  ];
}

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
export function checkForPlaceholders(truck: FoodTruck, patterns: RegExp[]): Partial<FoodTruck> {
  const updates: Partial<FoodTruck> = {};

  if (truck.name && patterns.some((pattern) => pattern.test(truck.name ?? ''))) {
    updates.name = undefined;
  }
  if (
    truck.description != undefined &&
    patterns.some((pattern) => pattern.test(truck.description ?? ''))
  ) {
    updates.description = undefined;
  }
  if (
    truck.price_range != undefined &&
    patterns.some((pattern) => pattern.test(truck.price_range ?? ''))
  ) {
    updates.price_range = undefined;
  }
  return updates;
}

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
export function processTruckForPlaceholders(
  truck: FoodTruck,
  patterns: RegExp[],
): Partial<FoodTruck> {
  const basicInfoUpdates = checkForPlaceholders(truck, patterns);
  const contactInfoUpdates = processContactInfoForPlaceholders(truck, patterns);
  const addressUpdates = processAddressForPlaceholders(truck, patterns);

  const updates: Partial<FoodTruck> = {
    ...basicInfoUpdates,
    ...getContactInfoUpdates(truck, contactInfoUpdates),
    ...getLocationUpdates(truck, addressUpdates),
  };

  return updates;
}

function getContactInfoUpdates(
  truck: FoodTruck,
  contactInfoUpdates: Partial<FoodTruck['contact_info']>,
): Partial<FoodTruck> | object {
if (contactInfoUpdates && Object.keys(contactInfoUpdates).length > 0) {
    return { contact_info: { ...truck.contact_info, ...contactInfoUpdates } };
  }
  return {};
}

function getLocationUpdates(
  truck: FoodTruck,
  addressUpdates: Partial<FoodTruck['current_location']>,
): Partial<FoodTruck> | object {
  if (Object.keys(addressUpdates).length > 0) {
    return { current_location: { ...truck.current_location, ...addressUpdates } };
  }
  return {};
}

/**
* Filters contact information of a food truck based on specified patterns.
* @example
* processContactInfoForPlaceholders(truck, patterns)
* returns filtered contact info with some fields possibly undefined
* @param {FoodTruck} truck - The food truck object containing contact information.
* @param {RegExp[]} patterns - Array of regular expressions to match against contact info.
* @returns {Partial<FoodTruck['contact_info']>} Returns contact information with fields set to undefined if they match any pattern.
* @description
*   - Checks phone, website, and email properties for matches with given patterns.
*   - Sets properties to undefined if they match any pattern.
*/
function processContactInfoForPlaceholders(
  truck: FoodTruck,
  patterns: RegExp[],
): Partial<FoodTruck['contact_info']> {
  const cleanContact: Partial<FoodTruck['contact_info']> = {};

  if (
    truck.contact_info?.phone !== undefined &&
    patterns.some((pattern) => pattern.test(truck.contact_info?.phone ?? ''))
  ) {
    cleanContact.phone = undefined;
  }
  if (
    truck.contact_info?.website !== undefined &&
    patterns.some((pattern) => pattern.test(truck.contact_info?.website ?? ''))
  ) {
    cleanContact.website = undefined;
  }
  if (
    truck.contact_info?.email !== undefined &&
    patterns.some((pattern) => pattern.test(truck.contact_info?.email ?? ''))
  ) {
    cleanContact.email = undefined;
  }
  return cleanContact;
}

/**
 * Processes the current location of a food truck by checking against patterns and updating placeholders.
 * @example
 * const truck = { current_location: { address: '123 Fake St' } };
 * const patterns = [/Fake/];
 * processAddressForPlaceholders(truck, patterns);
 * // Returns: { address: undefined }
 * @param {FoodTruck} truck - The food truck object containing the current location data.
 * @param {RegExp[]} patterns - An array of regular expression patterns used to identify placeholders in the address.
 * @returns {Partial<FoodTruck['current_location']>} An object containing the updated location data with address potentially set to undefined.
 * @description
 *   - The function checks whether the address of the food truck's current location matches any of the provided RegExp patterns.
 *   - If a match is found, the address in the returned object is set to undefined.
 *   - It ensures details of the truck's location can be sanitized by placeholder detection.
 */
function processAddressForPlaceholders(
  truck: FoodTruck,
  patterns: RegExp[],
): Partial<FoodTruck['current_location']> {
  const updatedLocation: Partial<FoodTruck['current_location']> = {};

  if (
    truck.current_location?.address !== undefined &&
    patterns.some((pattern) => pattern.test(truck.current_location.address ?? ''))
  ) {
    updatedLocation.address = undefined;
  }
  return updatedLocation;
}
