

// --- Type Definitions ---
interface FoodTruckSchedule {
  id: string;
  food_truck_id: string;
  day_of_week: number; // 0=Sun, 1=Mon, ...
  is_active: boolean;
}

interface FoodTruckEvent {
  id: string;
  title: string;
  event_date: string;
  location_address?: string;
}

interface FoodTruck {
  id: string;
  name: string;
  description: string;
  cuisine_type?: string;
  schedule?: FoodTruckSchedule[];
  events?: FoodTruckEvent[];
}

/**
 * Renders a food truck information card including its schedule and upcoming events.
 * @example
 * FoodTruckInfoCard({ truck: sampleTruck })
 * Renders a card component displaying the name, cuisine type, description, schedule, and events of the food truck.
 * @param {Object} { truck } - An object representing a food truck with details such as name, description, schedule, and events.
 * @param {FoodTruck} { truck.truck } - Food truck object containing details to be displayed on the card.
 * @returns {JSX.Element} A JSX element representing a styled card with food truck information.
 * @description
 *   - The function uses conditional rendering to display active days in bold and with the primary color.
 *   - It includes a section to list up to three upcoming events, if available, with each event's title, date, and optional location address.
 */
const FoodTruckCard = ({ truck }: { truck: FoodTruck }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">{truck.name}</h3>
        <span className="text-gray-500">{truck.cuisine_type}</span>
      </div>
      <p className="text-gray-700 mt-1">{truck.description}</p>

      {/* Display active days (grey out inactive) */}
      <div className="flex gap-1 mt-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
          <span
            key={day}
            className={
              truck.schedule?.find((s) => s.day_of_week === idx && s.is_active)
                ? 'font-bold text-primary'
                : 'text-gray-400'
            }
          >
            {day}
          </span>
        ))}
      </div>

      {/* Upcoming Events section */}
      {truck.events && truck.events.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-1">Upcoming Events</h4>
          <ul>
            {truck.events.slice(0, 3).map((event) => (
              <li key={event.id} className="mb-1">
                <span className="font-medium">{event.title}</span> &mdash; {event.event_date}
                {event.location_address !== undefined && event.location_address !== '' && (
                  <span className="ml-2 text-gray-500">@ {event.location_address}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FoodTruckCard;
