import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/ringring.png';

const LandingPage = () => {
  const navigate = useNavigate();

const handleGetStarted = async () => {
  const token = localStorage.getItem("token");

  // 1️⃣ Already logged in → Dashboard
  if (token) {
    navigate("/dashboard");
    return;
  }

  // 2️⃣ Check if email is saved (from payment or signup)
  const savedEmail =
    (localStorage.getItem("paidEmail") || localStorage.getItem("email") || "").trim().toLowerCase();

  // No email at all → go to payment
  if (!savedEmail) {
    navigate("/payment");
    return;
  }

  try {
    // 3️⃣ Ask backend if this email has an active subscription
    const res = await fetch(`https://ring-ring-eq46.onrender.com/api/payments/status?email=${savedEmail}`);
    const data = await res.json();

    if (data.subscription === "active") {
      navigate("/login"); // ✅ Paid user → login/signup
    } else {
      navigate("/payment"); // ❌ Not paid → payment page
    }
  } catch (err) {
    console.error("Error checking subscription:", err);
    navigate("/payment"); // fallback
  }
};



  useEffect(() => {
    document.title = "Ring Ring CRM – Smart Calling CRM";
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(135deg,rgb(11, 61, 36) 0%,rgb(52, 130, 91) 100%)",
        minHeight: "100vh",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      {/* Header Section */}
      <header style={{ textAlign: "center", padding: "60px 20px 30px" }}>
        <h1 style={{
          fontSize: "3rem",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <img src={logo} alt="logo" style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
             objectFit: "contain",
                 padding: "4px",
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }} />
          Ring Ring Crm
        </h1>
        <p style={{ fontSize: "1.5rem", marginTop: "10px" }}>
          Upload Your Leads, Start Calling, and Grow Faster.
        </p>
        <p style={{
          fontSize: "1.1rem",
          color: "#fffb9d",
          marginTop: "10px",
          fontWeight: 'bold'
        }}>
          🎁 Free for First 100 Users
        </p>
        <button
          onClick={handleGetStarted}
          style={{
            marginTop: "30px",
            padding: "15px 40px",
            fontSize: "1.1rem",
            borderRadius: "30px",
            background: "#000",
            color: "#00ff7f",
            border: "2px solid #00ff7f",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
            transition: "all 0.3s ease",
          }}
        >
           Get Started
        </button>

        <div style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "12px"
        }}>
          <Link to="/login" style={{
            padding: "10px 24px",
            borderRadius: "24px",
            background: "#ffffff",
            color: "#0b3d24",
            textDecoration: "none",
            fontWeight: 600,
            border: "2px solid #ffffff"
          }}>
            Login
          </Link>
          <Link to="/signup" style={{
            padding: "10px 24px",
            borderRadius: "24px",
            background: "transparent",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 600,
            border: "2px solid #ffffff"
          }}>
            Sign Up
          </Link>
        </div>
      </header>

      {/* How It Works Section */}
      <section style={{
        maxWidth: "1000px",
        margin: "50px auto",
        padding: "20px",
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: "20px"
      }}>
        <h2 style={{
          fontSize: "2rem",
          textAlign: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #fff",
          paddingBottom: "10px"
        }}>
          💡 How It Works
        </h2>
        <ul style={{
          fontSize: "1.1rem",
          lineHeight: "2",
          paddingLeft: "20px"
        }}>
          <li>📂 Upload your leads via CSV file.</li>
          <li>▶️ Click “Start Automatic Call”.</li>
          <li>📞 Calls start using your phone’s SIM automatically.</li>
          <li>📝 Write call status, notes & outcomes after each call.</li>
          <li>📊 Analyze performance in your dashboard.</li>
        </ul>
      </section>

      {/* Features Section */}
      <section style={{
        maxWidth: "1000px",
        margin: "50px auto",
        padding: "20px",
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: "20px"
      }}>
        <h2 style={{
          fontSize: "2rem",
          textAlign: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #fff",
          paddingBottom: "10px"
        }}>
          🎯 Features
        </h2>
        <ul style={{
          fontSize: "1.1rem",
          lineHeight: "2",
          paddingLeft: "20px"
        }}>
          <li>🧠 Smart Lead Management – add, filter & call with ease.</li>
          <li>📞 SIM-Based Automatic Calling – no need for VoIP.</li>
          <li>🗓️ Call Scheduling – never miss a follow-up.</li>
          <li>⚡ Instant Leads – convert business inquiries fast.</li>
          <li>🌐 Get Your Website – launch your bussiness online.</li>
          <li>📝 Call Notes – track outcomes for each lead.</li>
          <li>📥 CSV Import/Export – bulk manage thousands of leads.</li>
          <li>📊 Dashboard Analytics – monitor progress & success rates.</li>
        </ul>
      </section>
     <div style={{ padding: "50px 20px", textAlign: "center" }}>
  <h2 style={{ fontSize: "2rem", marginBottom: "30px", color: "#000" }}>💬 What Our Users Say</h2>

  <div style={{ display: "flex", flexDirection: "column", gap: "30px", maxWidth: "800px", margin: "auto" }}>
    <div style={{ background: "#ffffff", borderRadius: "15px", padding: "20px", border: "1px solid #e0e0e0", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", color: "#000" }}>
      <p style={{ fontStyle: "italic" }}>"Ring Ring CRM helped me boost my sales calls. The automatic dialer saved hours daily!"</p>
      <strong style={{ display: "block", marginTop: "10px" }}>– Ramesh Kumar, Sales Executive</strong>
    </div>

    <div style={{ background: "#ffffff", borderRadius: "15px", padding: "20px", border: "1px solid #e0e0e0", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", color: "#000" }}>
      <p style={{ fontStyle: "italic" }}>"Importing leads via CSV and scheduling follow-ups has never been easier. I love the simplicity!"</p>
      <strong style={{ display: "block", marginTop: "10px" }}>– Priya Sharma, Business Owner</strong>
    </div>

    <div style={{ background: "#ffffff", borderRadius: "15px", padding: "20px", border: "1px solid #e0e0e0", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", color: "#000" }}>
      <p style={{ fontStyle: "italic" }}>"I just click ‘Next’ to call — no more manual dialing! Highly recommend for telecallers."</p>
      <strong style={{ display: "block", marginTop: "10px" }}>– Ankit Verma, Call Center Agent</strong>
    </div>
  </div>
</div>



<div style={{ textAlign: "center", marginTop: "40px" }}>
  <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Follow Us</h2>
  <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
    <a href="https://facebook.com" target="_blank" rel="noreferrer">
      <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="30" height="30" />
    </a>
    <a href="https://instagram.com" target="_blank" rel="noreferrer">
      <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="30" height="30" />
    </a>
    <a href="https://twitter.com" target="_blank" rel="noreferrer">
      <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="30" height="30" />
    </a>
    <a href="https://linkedin.com" target="_blank" rel="noreferrer">
      <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="30" height="30" />
    </a>
  </div>
</div>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        marginTop: "50px",
        fontSize: "0.9rem",
        opacity: 0.6
      }}>
        &copy; {new Date().getFullYear()} Ring Ring CRM – Built for Smart Calling.
      </footer>
    </div>
  );
};

export default LandingPage;
