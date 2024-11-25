import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserRequest.css';
import Logo from '../../assets/wkwlogo.png';
import { useNavigate } from 'react-router-dom';

const UserRequest = () => {
  const [formData, setFormData] = useState({
    hrs_demande: '',
    service: '',
    transforme: '',
    date_demande: '',
    ref_mat: '',
    designiation: '',
  });
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  // Fetch user requests when the component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


   const baseURL = process.env.NODE_ENV === 'production'
    ? 'https://demande-2.onrender.com' 
    : 'http://localhost:8000';

  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const { hrs_demande, service, transforme, date_demande, ref_mat, designiation } = formData;

    // Validate input (basic validation, can be extended)
    if (!hrs_demande || !service || !transforme || !date_demande || !ref_mat || !designiation) {
      alert('All fields are required');
      return;
    }

    // Get the name of the logged-in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('userData'));
    if (!loggedInUser || !loggedInUser.name) {
      return;
    }

    // Append the user's name to formData
    const dataToSend = {
      ...formData,
      nom_demandeur: loggedInUser.name,
    };

    // Sending data using Axios
    axios
      .post('http://localhost:8000/api/submit-form', dataToSend)
      .then((response) => {
        if (response.data.success) {
          alert('Data successfully saved!');
          fetchRequests();
        } else {
          alert('Error saving data!');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('An error occurred!');
      });
  };

  const fetchRequests = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('userData'));
    console.log('Logged-in user:', loggedInUser);
    if (!loggedInUser || !loggedInUser.name) {
      alert('User not logged in');
      return;
    }

    axios
      .get('http://localhost:8000/api/get-requests', {
        params: { name: loggedInUser.name },
      })
      .then((response) => {
        const formattedRequests = response.data.requests.map((request) => {
          const date = new Date(request.date_demande);
          const formattedDate = date.toISOString().split('T')[0];
          return {
            ...request,
            date_demande: formattedDate,
          };
        });
        setRequests(formattedRequests);
      })
      .catch((err) => {
        console.error('Error fetching requests:', err);
        alert('An error occurred while fetching the requests');
      });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  return (
    <div>
      <header className="admin-header">
        <div className="logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h1 className="title-admin">Panneau de demande d'utilisateur</h1>

        <div className="header-buttons">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="user-request-form">
        {/* Form Fields */}
        <div className="form-group">
          <label>Date De Mise a Disposition</label>
          <input
            type="date"
            name="date_demande"
            value={formData.date_demande}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Heurs de demande</label>
          <input
            type="time"
            name="hrs_demande"
            placeholder="Select time"
            value={formData.hrs_demande}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Service</label>
          <input
            type="text"
            name="service"
            value={formData.service}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Mouvement</label>
          <select
            name="transforme"
            value={formData.transforme}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">Select</option>
            <option value="p1-to-p2">P1 to P2</option>
            <option value="p2-to-p1">P2 to P1</option>
          </select>
        </div>
        <div className="form-group">
          <label>Référence de Materiel</label>
          <input
            type="text"
            name="ref_mat"
            value={formData.ref_mat}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Designiation</label>
          <input
            type="text"
            name="designiation"
            value={formData.designiation}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>

      {/* Request Table */}
      <div className="requests-table">
        <h3>Your Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Date de Demande</th>
              <th>Heurs de demande</th>
              <th>Service</th>
              <th>Nom de Demandeur</th>
              <th>Direction</th>
              <th>Référence de Materiel</th>
              <th>Designiation</th>
              <th>Status</th>
              <th>Commentraire</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id} className={getStatusClass(request.status)}>
                  <td>{request.date_demande}</td>
                  <td>{request.hrs_demande}</td>
                  <td>{request.service}</td>
                  <td>{request.nom_demandeur}</td>
                  <td>{request.transforme}</td>
                  <td>{request.ref_mat}</td>
                  <td>{request.designiation}</td>
                  <td>{request.status || 'pending...'}</td>
                  <td>{request.commentaire || 'pending...'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRequest;
