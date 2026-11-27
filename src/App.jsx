
import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MatchCard from "./components/MatchCard";
import { isSupabaseConfigured, supabase } from "./supabase";
import "./App.css";

function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [bookingMatchId, setBookingMatchId] = useState(null);
  const [error, setError] = useState(
    isSupabaseConfigured
      ? ""
      : "Supabase is not configured. Add your project URL and publishable key to .env.local.",
  );
  const [notice, setNotice] = useState("");

  const fetchMatches = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    setMatches(data);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let active = true;

    const loadMatches = async () => {
      try {
        await fetchMatches();
        if (active) {
          setError("");
        }
      } catch (fetchError) {
        if (active) {
          setError(`Could not load matches: ${fetchError.message}`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMatches();

    const channel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          void loadMatches();
        },
      )
      .subscribe((status, subscriptionError) => {
        if (
          active &&
          (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
        ) {
          setError(
            `Realtime updates are unavailable${subscriptionError ? `: ${subscriptionError.message}` : "."}`,
          );
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [fetchMatches]);

  const handleBook = async (match) => {
    setBookingMatchId(match.id);
    setError("");
    setNotice("");

    let data;
    let bookingError;
    try {
      const response = await supabase.rpc("book_ticket", {
        p_match_id: match.id,
      });
      data = response.data;
      bookingError = response.error;
    } catch (requestError) {
      setError(`Could not book this ticket: ${requestError.message}`);
      setBookingMatchId(null);
      return;
    }
    setBookingMatchId(null);

    if (bookingError) {
      setError(
        bookingError.message.includes("MATCH_SOLD_OUT_OR_NOT_FOUND")
          ? "Sorry, this match is sold out."
          : `Could not book this ticket: ${bookingError.message}`,
      );
      return;
    }

    setNotice(`Ticket booked successfully. Booking reference: ${data}`);
    try {
      await fetchMatches();
    } catch (fetchError) {
      setError(`Booking succeeded, but matches could not refresh: ${fetchError.message}`);
    }
  };

  return (
    <>
      <Navbar />
      <Hero />

      <section className="matches">
        <h1>Upcoming IPL Matches</h1>

        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {loading && <p>Loading matches...</p>}
        {!loading && !error && matches.length === 0 && (
          <p>No upcoming matches are available.</p>
        )}

        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onBook={handleBook}
            isBooking={bookingMatchId === match.id}
          />
        ))}
      </section>
    </>
  );
}

export default App;
