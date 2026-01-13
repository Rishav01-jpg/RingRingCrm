import { useState } from "react";
import axios from "axios";
import "./CustomCrmDemo.css";

export default function CustomCrmDemo() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    crmType: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await axios.post(
        "https://ring-ring-eq46.onrender.com/api/customcrm/register",
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMsg("✅ Demo registered successfully! Check your email.");
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        crmType: "",
      });
    } catch (error) {
      console.error(error);
      setMsg("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crm-demo-wrapper">
      <div className="crm-demo-card">
        <h2>Custom CRM Demo</h2>
        <p className="subtitle">
          Book a free live CRM demo for your business
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            name="company"
            placeholder="Company / Business Name"
            value={form.company}
            onChange={handleChange}
          />

          <select
            name="crmType"
            value={form.crmType}
            onChange={handleChange}
            required
          >
            <option value="">Select Company Type</option>
            <option value="Real Estate">Real Estate</option>
            <option value="School">School</option>
            <option value="Bank">Bank</option>
            <option value="Gym">Gym</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Request Demo"}
          </button>
        </form>

        {msg && <p className="message">{msg}</p>}
      </div>
    </div>
  );
}
