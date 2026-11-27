
function MatchCard({ match, onBook, isBooking }) {
  const date = new Date(`${match.match_date}T00:00:00`);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="match-card">
      <h2>{match.team1} vs {match.team2}</h2>

      <p>Date: {formattedDate}</p>

      <p>Venue: {match.venue}</p>
      <p>Available seats: {match.available_seats}</p>

      <button
        onClick={() => onBook(match)}
        disabled={isBooking || match.available_seats <= 0}
      >
        {isBooking
          ? "Booking..."
          : match.available_seats <= 0
            ? "Sold Out"
            : "Book Tickets"}
      </button>
    </div>
  );
}

export default MatchCard;
