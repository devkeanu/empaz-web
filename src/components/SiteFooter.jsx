import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

const COLUMNS = [
  { title: "Markets", links: ["Forex", "Share CFDs", "Commodities", "Indices", "Crypto CFDs", "Spot metals"] },
  { title: "Platforms", links: ["Farverde Terminal", "MetaTrader 5", "MetaTrader 4", "Mobile app", "API & FIX", "Copy trading"] },
  { title: "Accounts", links: ["Standard", "Prime", "Raw spread", "Islamic", "Corporate"] },
  { title: "Company", links: ["About Farverde", "Regulation", "Legal documents", "Careers", "Press", "Contact"] },
];

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo inverse />
            <p className="footer__pitch">
              Multi-asset brokerage with institutional pricing, segregated client
              funds and a margin credit facility built for people who trade for a living.
            </p>
          </div>

          <div className="footer__cols">
            {COLUMNS.map((col) => (
              <div className="footer__col" key={col.title}>
                <h4 className="eyebrow">{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l}><a href="#top">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__risk">
          <span className="eyebrow eyebrow--ember">Risk warning</span>
          <p>
            CFDs are complex instruments and come with a high risk of losing money rapidly due
            to leverage. 74–89% of retail investor accounts lose money when trading CFDs.
            Consider whether you understand how CFDs work and whether you can afford to take
            the high risk of losing your money.
          </p>
        </div>

        <div className="footer__base">
          <span className="num">© {new Date().getFullYear()} Farverde Markets Ltd.</span>
          <div className="footer__baselinks">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Cookies</a>
            <Link to="/login">Client login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
