import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Configure axios - use environment variable in production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Components
const Login = ({ setUser, setIsAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login/`, { username, password });
      localStorage.setItem('token', response.data.tokens.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('taxpayer', JSON.stringify(response.data.taxpayer));
      setUser(response.data.user);
      setIsAdmin(response.data.user.is_staff);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Login to Municipal System</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/register">Don't have an account? Register here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    property_tax_amount: 0
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/register/`, formData);
      localStorage.setItem('token', response.data.tokens.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('taxpayer', JSON.stringify(response.data.taxpayer));
      setUser(response.data.user);
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Registration failed'));
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">Register as Taxpayer</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" name="username" className="form-control" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-control" onChange={handleChange} required />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Property Tax Amount</label>
                    <input type="number" name="property_tax_amount" className="form-control" onChange={handleChange} defaultValue="0" />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input type="text" name="first_name" className="form-control" onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="last_name" className="form-control" onChange={handleChange} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input type="text" name="phone" className="form-control" onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea name="address" className="form-control" onChange={handleChange}></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">Register</button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/login">Already have an account? Login here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaxpayerDashboard = ({ user, handleLogout }) => {
  const [taxpayer, setTaxpayer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedTaxpayer = JSON.parse(localStorage.getItem('taxpayer'));
    setTaxpayer(storedTaxpayer);
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/payments/`, 
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Payment successful! Transaction ID: ${response.data.transaction_id}`);
      setAmount('');
      fetchPayments();
      // Refresh taxpayer data
      const taxpayerResponse = await axios.get(`${API_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaxpayer(taxpayerResponse.data);
      localStorage.setItem('taxpayer', JSON.stringify(taxpayerResponse.data));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Payment failed');
    }
  };

  if (!taxpayer) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user.first_name || user.username}!</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">My Profile</div>
            <div className="card-body">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {taxpayer.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {taxpayer.address || 'N/A'}</p>
              <p><strong>Property Tax Amount:</strong> ${taxpayer.property_tax_amount}</p>
              <p>
                <strong>Status: </strong>
                <span className={taxpayer.is_paid ? 'status-paid' : 'status-unpaid'}>
                  {taxpayer.is_paid ? 'PAID' : 'UNPAID'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {!taxpayer.is_paid && (
            <div className="card">
              <div className="card-header">Make Payment</div>
              <div className="card-body">
                {message && <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
                <form onSubmit={handlePayment}>
                  <div className="mb-3">
                    <label className="form-label">Amount ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={taxpayer.property_tax_amount}
                      required
                    />
                    <small className="text-muted">Minimum: ${taxpayer.property_tax_amount}</small>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Pay Now</button>
                </form>
              </div>
            </div>
          )}
          {taxpayer.is_paid && (
            <div className="card">
              <div className="card-header">Payment Status</div>
              <div className="card-body text-center">
                <h3 className="status-paid">✓ You are all paid up!</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">Payment History</div>
        <div className="card-body">
          {payments.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>{payment.transaction_id}</td>
                    <td>${payment.amount}</td>
                    <td>{payment.description || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No payments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ handleLogout }) => {
  const [stats, setStats] = useState(null);
  const [unpaidTaxpayers, setUnpaidTaxpayers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const dashboardRes = await axios.get(`${API_URL}/admin/dashboard/`, { headers });
      setStats(dashboardRes.data);
      
      const unpaidRes = await axios.get(`${API_URL}/admin/unpaid/`, { headers });
      setUnpaidTaxpayers(unpaidRes.data.taxpayers);
      
      const paymentsRes = await axios.get(`${API_URL}/admin/payments/`, { headers });
      setAllPayments(paymentsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  const printUnpaidReport = () => {
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unpaid Taxpayers Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Municipal Management System</h1>
        <h2>Unpaid Taxpayers Report</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Property Tax Amount</th>
            </tr>
          </thead>
          <tbody>
            ${unpaidTaxpayers.map(t => `
              <tr>
                <td>${t.full_name}</td>
                <td>${t.user.email}</td>
                <td>${t.phone || 'N/A'}</td>
                <td>$${t.property_tax_amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="total">Total Unpaid: $${stats?.total_collected || 0}</p>
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="row">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3>{stats.total_taxpayers}</h3>
              <p>Total Taxpayers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="status-paid">{stats.paid_taxpayers}</h3>
              <p>Paid</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="status-unpaid">{stats.unpaid_taxpayers}</h3>
              <p>Unpaid</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3>${stats.total_collected}</h3>
              <p>Total Collected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Unpaid Taxpayers</span>
              <button className="btn btn-sm btn-secondary" onClick={printUnpaidReport}>Print Report</button>
            </div>
            <div className="card-body">
              {unpaidTaxpayers.length > 0 ? (
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidTaxpayers.map((t) => (
                      <tr key={t.id}>
                        <td>{t.full_name}</td>
                        <td>${t.property_tax_amount}</td>
                        <td className="status-unpaid">UNPAID</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">All taxpayers are paid!</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Recent Payments</div>
            <div className="card-body">
              {allPayments.length > 0 ? (
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Taxpayer</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td>{p.taxpayer_name}</td>
                        <td>${p.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No payments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App
function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.is_staff);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('taxpayer');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">Municipal Management</Link>
            {user && (
              <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </nav>

        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login setUser={setUser} setIsAdmin={setIsAdmin} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : isAdmin ? (
            <>
              <Route path="/" element={<AdminDashboard handleLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<TaxpayerDashboard user={user} handleLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
