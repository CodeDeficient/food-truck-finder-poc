import { z } from 'zod';
export declare const PriceRangeSchema: z.ZodUnion<[z.ZodLiteral<"$">, z.ZodLiteral<"$$">, z.ZodLiteral<"$$$">]>;
export declare const CoordinatesSchema: z.ZodObject<{
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lat?: number | undefined;
    lng?: number | undefined;
}, {
    lat?: number | undefined;
    lng?: number | undefined;
}>;
export declare const LocationDataSchema: z.ZodObject<{
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    landmarks: z.ZodArray<z.ZodString, "many">;
    coordinates: z.ZodObject<{
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        lat?: number | undefined;
        lng?: number | undefined;
    }, {
        lat?: number | undefined;
        lng?: number | undefined;
    }>;
    confidence: z.ZodNumber;
    raw_location_text: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    coordinates: {
        lat?: number | undefined;
        lng?: number | undefined;
    };
    confidence: number;
    landmarks: string[];
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    raw_location_text?: string | undefined;
}, {
    coordinates: {
        lat?: number | undefined;
        lng?: number | undefined;
    };
    confidence: number;
    landmarks: string[];
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    raw_location_text?: string | undefined;
}>;
export declare const DailyOperatingHoursSchema: z.ZodUnion<[z.ZodObject<{
    open: z.ZodString;
    close: z.ZodString;
    closed: z.ZodLiteral<false>;
}, "strip", z.ZodTypeAny, {
    closed: false;
    open: string;
    close: string;
}, {
    closed: false;
    open: string;
    close: string;
}>, z.ZodObject<{
    closed: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    closed: true;
}, {
    closed: true;
}>, z.ZodUndefined]>;
export declare const OperatingHoursSchema: z.ZodObject<{
    monday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    tuesday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    wednesday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    thursday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    friday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    saturday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    sunday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
}, "strip", z.ZodUnion<[z.ZodObject<{
    open: z.ZodString;
    close: z.ZodString;
    closed: z.ZodLiteral<false>;
}, "strip", z.ZodTypeAny, {
    closed: false;
    open: string;
    close: string;
}, {
    closed: false;
    open: string;
    close: string;
}>, z.ZodObject<{
    closed: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    closed: true;
}, {
    closed: true;
}>, z.ZodUndefined]>, z.objectOutputType<{
    monday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    tuesday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    wednesday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    thursday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    friday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    saturday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    sunday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
}, z.ZodUnion<[z.ZodObject<{
    open: z.ZodString;
    close: z.ZodString;
    closed: z.ZodLiteral<false>;
}, "strip", z.ZodTypeAny, {
    closed: false;
    open: string;
    close: string;
}, {
    closed: false;
    open: string;
    close: string;
}>, z.ZodObject<{
    closed: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    closed: true;
}, {
    closed: true;
}>, z.ZodUndefined]>, "strip">, z.objectInputType<{
    monday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    tuesday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    wednesday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    thursday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    friday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    saturday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
    sunday: z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>;
}, z.ZodUnion<[z.ZodObject<{
    open: z.ZodString;
    close: z.ZodString;
    closed: z.ZodLiteral<false>;
}, "strip", z.ZodTypeAny, {
    closed: false;
    open: string;
    close: string;
}, {
    closed: false;
    open: string;
    close: string;
}>, z.ZodObject<{
    closed: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    closed: true;
}, {
    closed: true;
}>, z.ZodUndefined]>, "strip">>;
export declare const MenuItemSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    dietary_tags: z.ZodArray<z.ZodAny, "many">;
    is_popular: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    dietary_tags: any[];
    description?: string | undefined;
    price?: string | number | undefined;
    is_popular?: boolean | undefined;
}, {
    name: string;
    dietary_tags: any[];
    description?: string | undefined;
    price?: string | number | undefined;
    is_popular?: boolean | undefined;
}>;
export declare const MenuCategorySchema: z.ZodObject<{
    name: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
        dietary_tags: z.ZodArray<z.ZodAny, "many">;
        is_popular: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        dietary_tags: any[];
        description?: string | undefined;
        price?: string | number | undefined;
        is_popular?: boolean | undefined;
    }, {
        name: string;
        dietary_tags: any[];
        description?: string | undefined;
        price?: string | number | undefined;
        is_popular?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    items: {
        name: string;
        dietary_tags: any[];
        description?: string | undefined;
        price?: string | number | undefined;
        is_popular?: boolean | undefined;
    }[];
}, {
    name: string;
    items: {
        name: string;
        dietary_tags: any[];
        description?: string | undefined;
        price?: string | number | undefined;
        is_popular?: boolean | undefined;
    }[];
}>;
export declare const ContactInfoSchema: z.ZodObject<{
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
}, {
    phone?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
}>;
export declare const SocialMediaSchema: z.ZodObject<{
    instagram: z.ZodOptional<z.ZodString>;
    facebook: z.ZodOptional<z.ZodString>;
    twitter: z.ZodOptional<z.ZodString>;
    tiktok: z.ZodOptional<z.ZodString>;
    yelp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    instagram?: string | undefined;
    facebook?: string | undefined;
    twitter?: string | undefined;
    tiktok?: string | undefined;
    yelp?: string | undefined;
}, {
    instagram?: string | undefined;
    facebook?: string | undefined;
    twitter?: string | undefined;
    tiktok?: string | undefined;
    yelp?: string | undefined;
}>;
export declare const ScheduledLocationSchema: z.ZodObject<{
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zip_code: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodString;
    start_time: z.ZodString;
    end_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    start_time: string;
    end_time: string;
    lat?: number | undefined;
    lng?: number | undefined;
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
}, {
    timestamp: string;
    start_time: string;
    end_time: string;
    lat?: number | undefined;
    lng?: number | undefined;
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
}>;
export declare const FoodTruckSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    current_location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    }, {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    }>;
    scheduled_locations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        zip_code: z.ZodOptional<z.ZodString>;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
        timestamp: z.ZodString;
        start_time: z.ZodString;
        end_time: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }, {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }>, "many">>;
    operating_hours: z.ZodObject<{
        monday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        friday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
    }, "strip", z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>, z.objectOutputType<{
        monday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        friday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
    }, z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>, "strip">, z.objectInputType<{
        monday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        friday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
    }, z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>, "strip">>;
    menu: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            price: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
            dietary_tags: z.ZodArray<z.ZodAny, "many">;
            is_popular: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }, {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }, {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }>, "many">;
    contact_info: z.ZodObject<{
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    }, {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    }>;
    social_media: z.ZodObject<{
        instagram: z.ZodOptional<z.ZodString>;
        facebook: z.ZodOptional<z.ZodString>;
        twitter: z.ZodOptional<z.ZodString>;
        tiktok: z.ZodOptional<z.ZodString>;
        yelp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    }, {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    }>;
    cuisine_type: z.ZodArray<z.ZodString, "many">;
    price_range: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"$">, z.ZodLiteral<"$$">, z.ZodLiteral<"$$$">]>>;
    specialties: z.ZodArray<z.ZodString, "many">;
    data_quality_score: z.ZodNumber;
    verification_status: z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"verified">, z.ZodLiteral<"flagged">]>;
    source_urls: z.ZodArray<z.ZodString, "many">;
    last_scraped_at: z.ZodString;
    test_run_flag: z.ZodOptional<z.ZodBoolean>;
    website: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    instagram_handle: z.ZodOptional<z.ZodString>;
    facebook_handle: z.ZodOptional<z.ZodString>;
    twitter_handle: z.ZodOptional<z.ZodString>;
    schedule: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    average_rating: z.ZodOptional<z.ZodNumber>;
    review_count: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    source_urls: string[];
    name: string;
    menu: {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }[];
    current_location: {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    };
    contact_info: {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    };
    cuisine_type: string[];
    data_quality_score: number;
    operating_hours: {
        monday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        tuesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        wednesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        thursday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        friday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        saturday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        sunday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    } & {
        [k: string]: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    };
    social_media: {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    };
    specialties: string[];
    verification_status: "pending" | "verified" | "flagged";
    last_scraped_at: string;
    email?: string | undefined;
    scheduled_locations?: {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }[] | undefined;
    schedule?: any[] | undefined;
    website?: string | undefined;
    description?: string | undefined;
    price_range?: "$" | "$$" | "$$$" | undefined;
    test_run_flag?: boolean | undefined;
    phone_number?: string | undefined;
    instagram_handle?: string | undefined;
    facebook_handle?: string | undefined;
    twitter_handle?: string | undefined;
    average_rating?: number | undefined;
    review_count?: number | undefined;
}, {
    source_urls: string[];
    name: string;
    menu: {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }[];
    current_location: {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    };
    contact_info: {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    };
    cuisine_type: string[];
    data_quality_score: number;
    operating_hours: {
        monday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        tuesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        wednesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        thursday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        friday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        saturday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        sunday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    } & {
        [k: string]: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    };
    social_media: {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    };
    specialties: string[];
    verification_status: "pending" | "verified" | "flagged";
    last_scraped_at: string;
    email?: string | undefined;
    scheduled_locations?: {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }[] | undefined;
    schedule?: any[] | undefined;
    website?: string | undefined;
    description?: string | undefined;
    price_range?: "$" | "$$" | "$$$" | undefined;
    test_run_flag?: boolean | undefined;
    phone_number?: string | undefined;
    instagram_handle?: string | undefined;
    facebook_handle?: string | undefined;
    twitter_handle?: string | undefined;
    average_rating?: number | undefined;
    review_count?: number | undefined;
}>;
export declare const TruckSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    current_location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    }, {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    }>;
    scheduled_locations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        zip_code: z.ZodOptional<z.ZodString>;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
        timestamp: z.ZodString;
        start_time: z.ZodString;
        end_time: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }, {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }>, "many">>;
    operating_hours: z.ZodObject<{
        monday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        friday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
    }, "strip", z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>, z.objectOutputType<{
        monday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        friday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
    }, z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>, "strip">, z.objectInputType<{
        monday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        friday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodLiteral<false>;
        }, "strip", z.ZodTypeAny, {
            closed: false;
            open: string;
            close: string;
        }, {
            closed: false;
            open: string;
            close: string;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed: true;
        }, {
            closed: true;
        }>, z.ZodUndefined]>;
    }, z.ZodUnion<[z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        closed: false;
        open: string;
        close: string;
    }, {
        closed: false;
        open: string;
        close: string;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed: true;
    }, {
        closed: true;
    }>, z.ZodUndefined]>, "strip">>;
    menu: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            price: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
            dietary_tags: z.ZodArray<z.ZodAny, "many">;
            is_popular: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }, {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }, {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }>, "many">;
    contact_info: z.ZodObject<{
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    }, {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    }>;
    social_media: z.ZodObject<{
        instagram: z.ZodOptional<z.ZodString>;
        facebook: z.ZodOptional<z.ZodString>;
        twitter: z.ZodOptional<z.ZodString>;
        tiktok: z.ZodOptional<z.ZodString>;
        yelp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    }, {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    }>;
    cuisine_type: z.ZodArray<z.ZodString, "many">;
    price_range: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"$">, z.ZodLiteral<"$$">, z.ZodLiteral<"$$$">]>>;
    specialties: z.ZodArray<z.ZodString, "many">;
    data_quality_score: z.ZodNumber;
    verification_status: z.ZodUnion<[z.ZodLiteral<"pending">, z.ZodLiteral<"verified">, z.ZodLiteral<"flagged">]>;
    source_urls: z.ZodArray<z.ZodString, "many">;
    last_scraped_at: z.ZodString;
    test_run_flag: z.ZodOptional<z.ZodBoolean>;
    website: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    instagram_handle: z.ZodOptional<z.ZodString>;
    facebook_handle: z.ZodOptional<z.ZodString>;
    twitter_handle: z.ZodOptional<z.ZodString>;
    schedule: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    average_rating: z.ZodOptional<z.ZodNumber>;
    review_count: z.ZodOptional<z.ZodNumber>;
} & {
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    source_urls: string[];
    name: string;
    menu: {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }[];
    current_location: {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    };
    contact_info: {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    };
    cuisine_type: string[];
    data_quality_score: number;
    operating_hours: {
        monday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        tuesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        wednesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        thursday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        friday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        saturday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        sunday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    } & {
        [k: string]: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    };
    social_media: {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    };
    specialties: string[];
    verification_status: "pending" | "verified" | "flagged";
    last_scraped_at: string;
    created_at: string;
    updated_at: string;
    email?: string | undefined;
    scheduled_locations?: {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }[] | undefined;
    schedule?: any[] | undefined;
    website?: string | undefined;
    description?: string | undefined;
    price_range?: "$" | "$$" | "$$$" | undefined;
    test_run_flag?: boolean | undefined;
    phone_number?: string | undefined;
    instagram_handle?: string | undefined;
    facebook_handle?: string | undefined;
    twitter_handle?: string | undefined;
    average_rating?: number | undefined;
    review_count?: number | undefined;
    is_active?: boolean | undefined;
}, {
    id: string;
    source_urls: string[];
    name: string;
    menu: {
        name: string;
        items: {
            name: string;
            dietary_tags: any[];
            description?: string | undefined;
            price?: string | number | undefined;
            is_popular?: boolean | undefined;
        }[];
    }[];
    current_location: {
        timestamp: string;
        lat: number;
        lng: number;
        address?: string | undefined;
    };
    contact_info: {
        phone?: string | undefined;
        email?: string | undefined;
        website?: string | undefined;
    };
    cuisine_type: string[];
    data_quality_score: number;
    operating_hours: {
        monday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        tuesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        wednesday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        thursday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        friday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        saturday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
        sunday?: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    } & {
        [k: string]: {
            closed: false;
            open: string;
            close: string;
        } | {
            closed: true;
        } | undefined;
    };
    social_media: {
        instagram?: string | undefined;
        facebook?: string | undefined;
        twitter?: string | undefined;
        tiktok?: string | undefined;
        yelp?: string | undefined;
    };
    specialties: string[];
    verification_status: "pending" | "verified" | "flagged";
    last_scraped_at: string;
    created_at: string;
    updated_at: string;
    email?: string | undefined;
    scheduled_locations?: {
        timestamp: string;
        start_time: string;
        end_time: string;
        lat?: number | undefined;
        lng?: number | undefined;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip_code?: string | undefined;
    }[] | undefined;
    schedule?: any[] | undefined;
    website?: string | undefined;
    description?: string | undefined;
    price_range?: "$" | "$$" | "$$$" | undefined;
    test_run_flag?: boolean | undefined;
    phone_number?: string | undefined;
    instagram_handle?: string | undefined;
    facebook_handle?: string | undefined;
    twitter_handle?: string | undefined;
    average_rating?: number | undefined;
    review_count?: number | undefined;
    is_active?: boolean | undefined;
}>;
