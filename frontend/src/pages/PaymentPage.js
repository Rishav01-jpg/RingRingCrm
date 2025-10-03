import React, { useState } from 'react';
import axios from 'axios';

const PaymentPage = () => {
  const [plan, setPlan] = useState('half'); // default plan
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!email) return alert('Please enter your email');
    setLoading(true);

    try {
      // 1️⃣ Create order on backend
      const res = await axios.post('https://ring-ring-eq46.onrender.com/api/payments/create-order', { email, plan });
      console.log('Order created:', res.data);

      const { order, key } = res.data;

      // 2️⃣ Razorpay checkout options
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Ring Ring CRM',
        description: plan === 'half' ? 'Half-Yearly Plan' : 'Yearly Plan',
        order_id: order.id,
        prefill: { email },
        handler: async function (response) {
          try {
            // 3️⃣ Verify payment on backend
            const verifyRes = await axios.post('https://ring-ring-eq46.onrender.com/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email
            });

           console.log('Payment verified:', verifyRes.data);

// ✅ Save email in localStorage so LandingPage can check status
localStorage.setItem('paidEmail', email.toLowerCase());

alert('Payment successful! You can now signup.');
window.location.href = '/signup';

          } catch (err) {
            console.error('Payment verification failed:', err.response?.data || err.message);
            alert('Payment verification failed. Please contact support.');
          }
        },
      };

      // 4️⃣ Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Order creation failed:', err.response?.data || err.message);
      alert('Payment failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgb(11, 61, 36) 0%, rgb(52, 130, 91) 100%)', padding: '0 10px' }}>
      <div style={{ maxWidth: 400, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 20, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', padding: 30, textAlign: 'center', backdropFilter: 'blur(6px)' }}>
        <h2 style={{ color: '#fff', marginBottom: 10, fontWeight: 700, fontSize: 28 }}>Choose Plan & Pay</h2>
        <div style={{ marginBottom: 24, textAlign: 'left', color: '#fff', fontSize: 16 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Features Included:</h3>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li>📱 Sim-based automatic one-click calling</li>
            <li>📅 Scheduled calls</li>
            <li>🗂️ Basic CRM</li>
            <li>🤖 Basic AI template (3 downloads/day)</li>
            <li>📤 CSV upload</li>
            <li>💬 WhatsApp bulk messaging <span style={{ color: '#ffd700' }}>(Upcoming)</span></li>
          </ul>
        </div>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 20, padding: 12, borderRadius: 8, border: 'none', fontSize: 16 }}
        />
        <div style={{ marginBottom: 20, color: '#fff', fontWeight: 500, fontSize: 17 }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              value="half"
              checked={plan === 'half'}
              onChange={() => setPlan('half')}
              style={{ marginRight: 8 }}
            /> Half-Yearly <span style={{ fontWeight: 700, color: '#ffd700' }}>₹2999</span>
          </label>
          <label>
            <input
              type="radio"
              value="yearly"
              checked={plan === 'yearly'}
              onChange={() => setPlan('yearly')}
              style={{ marginRight: 8 }}
            /> Yearly <span style={{ fontWeight: 700, color: '#ffd700' }}>₹4999</span>
          </label>
        </div>
        <button onClick={handlePayment} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, background: 'linear-gradient(135deg, #34a25b 0%, #0b3d24 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', boxShadow: '0 2px 8px rgba(52,130,91,0.2)', cursor: 'pointer', transition: 'background 0.3s' }}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
