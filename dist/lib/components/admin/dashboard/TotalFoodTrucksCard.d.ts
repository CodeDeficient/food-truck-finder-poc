interface TotalFoodTrucksCardProps {
    readonly totalFoodTrucks: number;
    readonly pendingVerifications: number;
}
/**
 * Renders a card displaying the total number of food trucks and pending verifications.
 * @example
 * TotalFoodTrucksCard({ totalFoodTrucks: 24, pendingVerifications: 3 })
 * // returns a React component with the total food trucks as 24 and 3 pending verification.
 * @param {Readonly<TotalFoodTrucksCardProps>} {totalFoodTrucks, pendingVerifications} - Props containing the number of total food trucks and pending verifications.
 * @returns {JSX.Element} A JSX element representing the TotalFoodTrucksCard component.
 * @description
 *   - Utilizes React functional component syntax.
 *   - Uses Tailwind CSS for styling.
 *   - Card displays current numbers of food trucks and verifications dynamically.
 */
export declare function TotalFoodTrucksCard({ totalFoodTrucks, pendingVerifications, }: Readonly<TotalFoodTrucksCardProps>): import("react").JSX.Element;
export {};
