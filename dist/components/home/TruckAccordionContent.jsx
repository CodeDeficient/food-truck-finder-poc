'use client';
import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { TruckAccordionItem } from '@/components/trucks/TruckAccordionItem';
export const TruckAccordionContent = ({ filteredTrucks, selectedTruckId, setSelectedTruckId, isOpen, userLocation, }) => {
    if (filteredTrucks.length === 0) {
        return (<div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No food trucks found in your area.</p>
        <p className="text-sm mt-2">Try expanding your search radius or check back later!</p>
      </div>);
    }
    // Smart sorting: prioritize open trucks and specific locations
    const sortedTrucks = [...filteredTrucks].sort((a, b) => {
        const aOpen = isOpen(a);
        const bOpen = isOpen(b);
        const aHasAddress = !!(a.current_location?.address && a.current_location.address.trim());
        const bHasAddress = !!(b.current_location?.address && b.current_location.address.trim());
        // First, sort by open/closed status (open first)
        if (aOpen !== bOpen) {
            return aOpen ? -1 : 1;
        }
        // Then sort by specific address vs city only (specific first)
        if (aHasAddress !== bHasAddress) {
            return aHasAddress ? -1 : 1;
        }
        // Finally, sort alphabetically by name
        return a.name.localeCompare(b.name);
    });
    return (<Accordion type="single" collapsible value={selectedTruckId} onValueChange={(value) => setSelectedTruckId(value || undefined)} className="space-y-2">
      {sortedTrucks.map((truck) => (<TruckAccordionItem key={truck.id} truck={truck} selectedTruckId={selectedTruckId} setSelectedTruckId={setSelectedTruckId} isOpen={isOpen} userLocation={userLocation}/>))}
    </Accordion>);
};
