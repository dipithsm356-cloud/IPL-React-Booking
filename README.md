# IPL Ticket Booking

The app loads matches from Supabase, books tickets in PostgreSQL, and refreshes the match list when database changes arrive through Realtime.

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). This creates the `matches` and `bookings` tables, adds sample matches, enables row-level security, creates the atomic booking function, and adds `matches` to the Realtime publication.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project's Connect/API Keys dashboard. The publishable key is intended for browser use; never put a `service_role` or secret key in this app.
4. Install dependencies and start the app:

   ```sh
   npm install
   npm run dev
   ```

5. Book a match in the app, then check the `bookings` and `matches` tables in Supabase Table Editor. Each booking creates a row and decrements that match's `available_seats`.

Restart the Vite server after changing `.env.local`. The app uses `book_ticket` as a PostgreSQL transaction so simultaneous bookings cannot oversell seats or leave a booking and seat count out of sync. Matches are publicly readable; booking writes are performed only by that restricted database function.
