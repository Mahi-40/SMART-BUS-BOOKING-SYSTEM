
-- =========================
-- 1. PROFILES TABLE
-- =========================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =========================
-- 2. USER ROLES (separate table — security best practice)
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- =========================
-- 3. BUSES TABLE (publicly readable)
-- =========================
CREATE TABLE public.buses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  duration TEXT,
  bus_type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 4.0,
  total_seats INT NOT NULL DEFAULT 36,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buses are viewable by everyone"
  ON public.buses FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage buses"
  ON public.buses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- 4. SEATS TABLE
-- =========================
CREATE TABLE public.seats (
  id BIGSERIAL PRIMARY KEY,
  bus_id BIGINT NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  booked BOOLEAN NOT NULL DEFAULT false,
  booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(bus_id, seat_number)
);

CREATE INDEX idx_seats_bus_id ON public.seats(bus_id);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seats are viewable by everyone"
  ON public.seats FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can book seats"
  ON public.seats FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- =========================
-- 5. BOOKINGS TABLE
-- =========================
CREATE TABLE public.bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bus_id BIGINT NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  passenger_name TEXT NOT NULL,
  seat_numbers TEXT[] NOT NULL,
  total_amount NUMERIC NOT NULL,
  travel_date DATE,
  booking_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =========================
-- 6. TRIGGERS
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + assign default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate seats when a bus is created
CREATE OR REPLACE FUNCTION public.generate_seats_for_bus()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  i INT;
  prefix TEXT;
BEGIN
  FOR i IN 1..NEW.total_seats LOOP
    prefix := CASE WHEN i <= NEW.total_seats / 2 THEN 'L' ELSE 'U' END;
    INSERT INTO public.seats (bus_id, seat_number)
    VALUES (NEW.id, prefix || i);
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_seats
  AFTER INSERT ON public.buses
  FOR EACH ROW EXECUTE FUNCTION public.generate_seats_for_bus();
