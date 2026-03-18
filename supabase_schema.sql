-- ==========================================
-- SUPABASE SCHEMA MIGRATION SCRIPT
-- ==========================================

-- 1. Create Enums for strict typing
CREATE TYPE user_role AS ENUM ('admin', 'buddy', 'participant');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'canceled');

-- 2. Users Table
-- If using Supabase Auth, the 'id' column usually matches auth.users.id.
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Availabilities Table
-- Stores the time slots offered by buddies.
CREATE TABLE public.availabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buddy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL, -- e.g., '09:00:00'
    end_time TIME NOT NULL,   -- e.g., '09:20:00'
    booked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Slot Requests Table
-- Tracks participants asking to join a specific availability slot.
CREATE TABLE public.slot_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    availability_id UUID NOT NULL REFERENCES public.availabilities(id) ON DELETE CASCADE,
    topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate requests for the same slot by the same participant
    UNIQUE(participant_id, availability_id) 
);

-- 5. Meetings Table
-- Stores confirmed 1:1 sessions after an admin matches a buddy and participant.
CREATE TABLE public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    availability_id UUID REFERENCES public.availabilities(id) ON DELETE SET NULL,
    buddy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    meeting_link TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status meeting_status DEFAULT 'scheduled' NOT NULL,
    topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Meeting Participants (Junction Table)
-- Although sessions are 1:1, this setup perfectly satisfies the `participants: string[]` 
-- array type you currently use in your App state.
CREATE TABLE public.meeting_participants (
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (meeting_id, participant_id)
);

-- 7. Session Logs Table
-- For admin analytics.
CREATE TABLE public.session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- RLS (Row Level Security) Baseline
-- ==========================================
-- Enable RLS on all tables to ensure secure access if queried from the browser.
-- (You will need to write specific policies based on how your app queries Supabase).
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
