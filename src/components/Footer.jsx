import "./footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const categories = [
    "সর্বশেষ",
    "জাতীয়",
    "রাজনীতি",
    "খেলা",
    "আন্তর্জাতিক",
    "আরও",
  ];

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ===== Logo / About ===== */}
        <div className="footer-section">
          <h2 className="footer-logo">BanglaBarta</h2>
          <p>
            BanglaBartaa - সত্যের পথে, সংবাদের সাথে!
            নির্ভরযোগ্য ও আপডেটেড খবরের জন্য BanglaBartaa-র সাথেই থাকুন।
          </p>
        </div>

        {/* ===== Categories ===== */}
        <div className="footer-section">
          <h3>Categories</h3>
          <ul>
            {categories.map((cat) => (
              <li key={cat}>
                <Link to={`/category/${encodeURIComponent(cat)}`}>
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Company ===== */}
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </div>

        {/* ===== Newsletter ===== */}
        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Subscribe to get daily news updates.</p>

          <form
            className="newsletter"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed successfully!");
            }}
          >
            <input type="email" placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="footer-bottom">
        <p>© 2026 BanglaBartaa. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;