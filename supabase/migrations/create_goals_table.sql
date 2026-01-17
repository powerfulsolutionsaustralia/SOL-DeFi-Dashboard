-- Create goals table for tracking financial targets
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_sol NUMERIC NOT NULL,
    current_sol NUMERIC NOT NULL,
    target_apy NUMERIC NOT NULL,
    days_to_goal INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'achieved', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Allow public access for the agent
CREATE POLICY "Enable read access for all users" ON public.goals FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.goals FOR UPDATE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
