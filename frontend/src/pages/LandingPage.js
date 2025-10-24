import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/ringring.png';
import BookDemoForm from "../components/BookDemoForm";
import Button from '@mui/material/Button';
import circuitBg from '../assets/circuit-board.svg';
import rocketSvg from '../assets/rocket.svg';
import graphSvg from '../assets/graph.svg';

// ----------------------------------------------------------------------
// 1. CUSTOM HOOK FOR MEDIA QUERY (Handles responsiveness for inline styles)
// ----------------------------------------------------------------------
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false); // Default to false on first render

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    // Set initial state
    setMatches(media.matches);

    // Listen for changes
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};
// ----------------------------------------------------------------------


const LandingPage = () => {
  const navigate = useNavigate();
  const [demoFormOpen, setDemoFormOpen] = useState(false);
  // Check for desktop/tablet size (e.g., wider than 768px)
  const isDesktop = useMediaQuery('(min-width: 768px)'); 

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

  // Define column styles using the desktop flag
  const columnStyle = {
    flex: isDesktop ? "1" : "0 0 100%", // Take full width on mobile
    minWidth: isDesktop ? "250px" : "100%",
    textAlign: isDesktop ? "center" : "center",
    padding: "0 20px",
    marginBottom: isDesktop ? "0" : "30px", // Add space between sections on mobile
  };


  return (
    <div
      style={{
        background: "#0b3d24",
        backgroundImage: `url(${circuitBg})`,
        backgroundSize: "cover",
        backgroundRepeat: "repeat",
        minHeight: "100vh",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Header Section */}
      <header style={{ 
        textAlign: "center", 
        padding: "30px 20px 30px",
        position: "relative",
        zIndex: 2
      }}>
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
          Upload Your contacts, Start Calling, and Grow Faster.
        </p>
        <p style={{
          fontSize: "1.1rem",
          color: "#fffb9d",
          marginTop: "10px",
          fontWeight: 'bold'
        }}>
          🎁Introductory price available for first 100 sign-ups
        </p>
        
        {/* Three-column layout for main content */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "40px",
          flexWrap: "wrap",
          // FIX: Change layout direction on mobile to ensure stacking order
          flexDirection: isDesktop ? 'row' : 'column', 
        }}>
          {/* Left column - Rocket and Accelerate */}
          <div style={{
            ...columnStyle,
            // FIX: Set order 2 on mobile to push this below the buttons
            order: isDesktop ? 1 : 2, 
          }}>
            <img src={rocketSvg} alt="Rocket" style={{ width: "150px", height: "150px" }} />
            <h3 style={{ fontSize: "1.5rem", marginTop: "20px", textTransform: "uppercase" }}>
              Accelerate Your Bussiness
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              Eliminate manual dialing and instantly log every call and outcome.
              Focus 100% on the conversation.
            </p>
          </div>
          
          {/* Middle column - Buttons (This is what you want on top!) */}
          <div style={{
            flex: isDesktop ? "1" : "0 0 100%",
            minWidth: isDesktop ? "300px" : "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            // FIX: Set order 1 on mobile to ensure this is the first item
            order: 1, 
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                marginBottom: "20px",
                padding: "15px 40px",
                fontSize: "1.1rem",
                borderRadius: "30px",
                background: "#000",
                color: "#00ff7f",
                border: "2px solid #00ff7f",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                transition: "all 0.3s ease",
                width: "200px"
              }}
            >
              Get Started
            </button>
            
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "20px"
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
            
            <Button
              onClick={() => setDemoFormOpen(true)}
              style={{
                padding: "10px 24px",
                borderRadius: "24px",
                background: "#00ff7f",
                color: "#0b3d24",
                textDecoration: "none",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                width: "180px",
                textTransform: "uppercase"
              }}
            >
              Book Live Demo
            </Button>
          </div>
          
          {/* Right column - Graph and Optimize */}
          <div style={{
            ...columnStyle,
            // FIX: Set order 3 on mobile to push this below the buttons and the other side content
            order: isDesktop ? 3 : 3, 
          }}>
            <img src={graphSvg} alt="Graph" style={{ width: "150px", height: "150px" }} />
            <h3 style={{ fontSize: "1.5rem", marginTop: "20px", textTransform: "uppercase" }}>
              Optimize For Success
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              Connect with more prospects per hour and close deals faster. See
              immediate ROI on your cantact lists.
            </p>
          </div>
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
          <li>📂 Upload your contacts via CSV file.</li>
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
          <li>🧠 Smart contact Management – add, filter & call with ease.</li>
          <li>📞 SIM-Based Automatic Calling – no need for VoIP.</li>
          <li>🗓️ Call Scheduling – never miss a follow-up.</li>
          <li>⚡ Instant contact – convert business inquiries fast.</li>
          <li>🌐 Get Your Website – launch your bussiness online.</li>
          <li>📝 Call Notes – track outcomes for each contact.</li>
          <li>📥 CSV Import/Export – bulk manage thousands of contacts.</li>
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
      <p style={{ fontStyle: "italic" }}>"Importing contacts via CSV and scheduling follow-ups has never been easier. I love the simplicity!"</p>
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
      
      {/* Book Demo Form Dialog */}
      <BookDemoForm open={demoFormOpen} onClose={() => setDemoFormOpen(false)} />
      {/* Contact Section */}
<section
  style={{
    backgroundColor: "#f9fafc",
    padding: "60px 20px",
    textAlign: "center",
  }}
>
  <h2
    style={{
      fontSize: "2.2rem",
      fontWeight: "bold",
      color: "#000407ff",
      marginBottom: "10px",
    }}
  >
    Ring Ring CRM
  </h2>
  <p style={{ color: "#555", fontSize: "1.1rem", marginBottom: "30px" }}>
    We’d love to hear from you! Reach out using any of the options below.
  </p>

  <div
    style={{
      maxWidth: "600px",
      margin: "0 auto",
      textAlign: "left",
      background: "#0b3d24",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
      <span style={{ color: "#1976d2", marginRight: "10px" }}>📍</span>
      <p style={{ margin: 0 }}>burmamines, jamshedpur,831007, India</p>
    </div>

    <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
      <span style={{ color: "#1976d2", marginRight: "10px" }}>📞</span>
      <p style={{ margin: 0 }}>+91 8210690050</p>
    </div>

    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ color: "#1976d2", marginRight: "10px" }}>✉️</span>
      <a
        href="mailto:ringringcrm@gmail.com"
        style={{ textDecoration: "none", color: "#1976d2" }}
      >
        support@ringringcrm.com
      </a>
    </div>
  </div>
</section>

    </div>
  );
};

export default LandingPage;