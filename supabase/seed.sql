-- Seed script to populate the database with 10 fake members
-- Run this in Supabase SQL Editor or via psql

-- Insert 10 fake members
-- Note: Replace 'YOUR_USER_ID' with your actual user ID from auth.users table
-- You can find it by running: SELECT id, email FROM auth.users LIMIT 1;

INSERT INTO public.members (user_id, first_name, last_name, email, date_of_birth, date_joined, status)
VALUES
  -- Replace this user_id with yours:
  ((SELECT id FROM auth.users LIMIT 1), 'Emma', 'Johnson', 'emma.johnson@example.com', '1992-05-20', '2024-01-15', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Liam', 'Smith', 'liam.smith@example.com', '1988-11-03', '2024-02-20', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Olivia', 'Brown', 'olivia.brown@example.com', '1995-03-14', '2024-03-10', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Noah', 'Davis', 'noah.davis@example.com', '1990-07-22', '2024-04-05', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Ava', 'Martinez', 'ava.martinez@example.com', '1993-09-18', '2024-05-12', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Ethan', 'Garcia', 'ethan.garcia@example.com', '1987-01-30', '2024-06-08', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Sophia', 'Wilson', 'sophia.wilson@example.com', '1996-12-05', '2024-07-22', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Mason', 'Anderson', 'mason.anderson@example.com', '1991-04-17', '2024-08-14', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'Isabella', 'Taylor', 'isabella.taylor@example.com', '1994-08-25', '2024-11-03', 'active'),
  ((SELECT id FROM auth.users LIMIT 1), 'James', 'Thomas', 'james.thomas@example.com', '1989-06-12', '2025-01-08', 'active');

-- Verify the insert
SELECT COUNT(*) as total_members FROM public.members;
SELECT first_name, last_name, email, date_joined FROM public.members ORDER BY date_joined;
