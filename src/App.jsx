import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DataProvider } from "./store/DataContext.jsx";
import AppShell from "./layouts/AppShell.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Ledger from "./pages/Ledger.jsx";
import Deposit from "./pages/Deposit.jsx";
import Admin from "./pages/Admin.jsx";

/** Route changes should land at the top, except for in-page anchors. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function NotFound() {
  return (
    <div className="nf">
      <div>
        <span className="eyebrow eyebrow--dot eyebrow--ember">Error 404</span>
        <h1>404</h1>
        <p>That page is not on the book.</p>
        <Link to="/" className="btn btn--ink">Back to Farverde</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
          <Route path="/dashboard/ledger" element={<AppShell><Ledger /></AppShell>} />
          <Route path="/dashboard/deposit" element={<AppShell><Deposit /></AppShell>} />
          <Route path="/admin" element={<AppShell role="admin"><Admin /></AppShell>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
