-- Migration: Add events and food_truck_schedules tables

CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    food_truck_id uuid REFERENCES public.food_trucks(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    start_time time,
    end_time time,
    location_address text,
    location_lat double precision,
    location_lng double precision,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.food_truck_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    food_truck_id uuid REFERENCES public.food_trucks(id) ON DELETE CASCADE,
    day_of_week int NOT NULL, -- 0=Sunday, 6=Saturday
    is_active boolean NOT NULL DEFAULT true,
    start_time time,
    end_time time,
    recurring boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
