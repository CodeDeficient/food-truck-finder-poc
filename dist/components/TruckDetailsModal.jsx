'use client';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTruckCard } from '@/hooks/useTruckCard';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';
import { X, MapPin, Clock, Phone, Globe, Star } from 'lucide-react';
import { MenuSection } from '@/components/ui/MenuSection';
import { SocialMediaSection } from '@/components/ui/SocialMediaSection';
import { ContactSection } from '@/components/ui/ContactSection';
const TruckModalHeader = ({ truck, name, cuisine_type, isTruckOpen, average_rating, review_count }) => {
    var _a;
    return (<DialogHeader>
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <DialogTitle className="text-2xl font-bold neon-text mb-2">
          {name}
        </DialogTitle>
        {((_a = truck.current_location) === null || _a === void 0 ? void 0 : _a.address) !== undefined && truck.current_location.address !== '' && (<div className="flex items-center text-muted-foreground mb-2">
            <MapPin className="size-4 mr-2"/>
            <span>{truck.current_location.address}</span>
          </div>)}
        {cuisine_type.length > 0 && (<div className="flex flex-wrap gap-2 mb-3">
            {cuisine_type.map((cuisine) => (<Badge key={cuisine} variant="secondary">
                {cuisine}
              </Badge>))}
          </div>)}
      </div>
      <div className="flex flex-col items-end space-y-2">
        <Badge variant={isTruckOpen ? 'open' : 'secondary'} className="mb-2">
          {isTruckOpen ? 'Open Now' : 'Closed'}
        </Badge>
        {average_rating > 0 && (<div className="flex items-center text-sm text-muted-foreground">
            <Star className="size-4 mr-1 fill-yellow-400 text-yellow-400"/>
            <span>{average_rating.toFixed(1)}</span>
            {review_count > 0 && <span className="ml-1">({review_count} reviews)</span>}
          </div>)}
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="hover:neon-border">
            <X className="size-4"/>
          </Button>
        </DialogClose>
      </div>
    </div>
  </DialogHeader>);
};
const TruckModalContent = ({ description, todayHours, priceRange, popularItems, phone, email, website, social_media, verification_status }) => (<div className="space-y-6">
    
    {description !== '' && (<div>
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>)}

    {todayHours !== undefined && todayHours.closed !== true && (<div>
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Clock className="size-4 mr-2"/>
          Today's Hours
        </h3>
        <p className="text-muted-foreground">
          {todayHours.open} - {todayHours.close}
        </p>
      </div>)}

    {priceRange !== undefined && priceRange !== '' && (<div>
        <h3 className="text-lg font-semibold mb-2">Price Range</h3>
        <Badge variant="outline" className="text-lg">
          {priceRange}
        </Badge>
      </div>)}

    {popularItems.length > 0 && (<div>
        <h3 className="text-lg font-semibold mb-3">Popular Items</h3>
        <MenuSection items={popularItems.map(item => {
            var _a;
            return ({
                name: item.name,
                price: formatPrice((_a = item.price) !== null && _a !== void 0 ? _a : 0),
            });
        })}/>
      </div>)}

    {(phone !== '' || email !== '' || website !== '') && (<div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Phone className="size-4 mr-2"/>
          Contact Information
        </h3>
        <ContactSection contactInfo={{ phone, website }}/>
      </div>)}

    {Object.keys(social_media).length > 0 && typeof social_media === 'object' && (<div>
        <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
        <SocialMediaSection socialMedia={social_media}/>
      </div>)}
  </div>);
export function TruckDetailsModal({ truck, isOpen, onClose, isTruckOpen }) {
    // Defensive checks for required data
    if (!truck || !truck.id) {
        return (<Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Unable to load truck details. Invalid data.</p>
          <Button onClick={onClose} variant="default">Close</Button>
        </DialogContent>
      </Dialog>);
    }
    const { popularItems, priceRange, todayHours } = useTruckCard(truck);
    const { name = 'Unnamed Truck', description = '', cuisine_type = [], social_media = {}, contact_info: { phone = '', email = '', website = '' } = {}, average_rating = 0, review_count = 0, } = truck;
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto z-[10001]">
        <TruckModalHeader truck={truck} name={name} cuisine_type={cuisine_type} isTruckOpen={isTruckOpen} average_rating={average_rating} review_count={review_count}/>
        <TruckModalContent description={description} todayHours={todayHours} priceRange={priceRange} popularItems={popularItems} phone={phone} email={email} website={website} social_media={social_media} verification_status={truck.verification_status || 'pending'}/>
        <div className="flex gap-3 pt-4 border-t border-border">
          {website !== '' && (<Button asChild variant="neon" className="flex-1">
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Globe className="size-4 mr-2"/>
                Visit Website
              </a>
            </Button>)}
          {truck.verification_status === 'verified' && (<Button variant="default" className="flex-1" disabled>
              Book Catering
            </Button>)}
        </div>
      </DialogContent>
    </Dialog>);
}
