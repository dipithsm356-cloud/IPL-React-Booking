
function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        IPL 2026
      </div>

      <ul className="nav-links">
        <li>Home</li>
        <li>Matches</li>
        <li>Teams</li>
        <li>Contact</li>
      </ul>

      <button className="nav-btn">
        Book Tickets
      </button>
    </nav>
  );
}

export default Navbar;
