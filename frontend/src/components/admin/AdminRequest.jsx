import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminRequest.css';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/wkwlogo.png'

const AdminRequest = () => {
  const [requests, setRequests] = useState([]);
  const [removedRequests, setRemovedRequests] = useState(() => {
    const savedRemovedRequests = localStorage.getItem('removedRequests');
    return savedRemovedRequests ? JSON.parse(savedRemovedRequests) : [];
  });
  const [rejectComments, setRejectComments] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const navigate = useNavigate();

  // Fetch requests from backend
  useEffect(() => {
    axios
      .get('http://localhost:8000/api/requests')
      .then((response) => {
        const formattedRequests = response.data.map((request) => {
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
      });
  }, []);

  // Update localStorage whenever removedRequests changes
  useEffect(() => {
    localStorage.setItem('removedRequests', JSON.stringify(removedRequests));
  }, [removedRequests]);

  // Handle approve
  const handleApprove = (id) => {
    axios
      .post('http://localhost:8000/api/approve-request', { id })
      .then((response) => {
        alert(response.data.message);
        setRemovedRequests((prev) => [...prev, id]);
      })
      .catch((err) => {
        console.error('Error approving request:', err);
      });
  };

  // Handle reject
  const handleReject = (id) => {
    const commentaire = rejectComments[id] || '';
    if (!commentaire.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    axios
      .post('http://localhost:8000/api/reject-request', { id, commentaire })
      .then((response) => {
        alert(response.data.message);
        setRemovedRequests((prev) => [...prev, id]); // Add ID to removed requests
        setShowCommentInput((prev) => ({ ...prev, [id]: false })); // Hide comment input
      })
      .catch((err) => {
        console.error('Error rejecting request:', err);
      });
  };

  // Handle comment input change
  const handleCommentChange = (id, value) => {
    setRejectComments((prev) => ({ ...prev, [id]: value }));
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Filter visible requests
  const visibleRequests = requests.filter(
    (request) => !removedRequests.includes(request.id)
  );

  return (
    <div className="admin-request-container">
      <header className="admin-header">
        <div className="logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h1 className='title-admin'>Admin Request Panel</h1>

        <div className="header-buttons">
          <Link to="/archive" className="archive-button">
            Archive
          </Link>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-request-panel">
      
        <table className="request-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Nom Demandeur</th>
              <th>Date Demande</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.service}</td>
                <td>{request.nom_demandeur}</td>
                <td>{request.date_demande}</td>
                <td>{request.status || 'Pending'}</td>
                <td>
                  <button className='aprrove-btn' onClick={() => handleApprove(request.id)}>
                    Approve
                  </button>
                  <button className='reject-btn'
                    onClick={() =>
                      setShowCommentInput((prev) => ({
                        ...prev,
                        [request.id]: !prev[request.id],
                      }))
                    }
                  >
                    Reject
                  </button>
                  {showCommentInput[request.id] && (
                    <div className="reject-comment">
                      <input
                        type="text"
                        placeholder="Reason for rejection"
                        value={rejectComments[request.id] || ''}
                        onChange={(e) =>
                          handleCommentChange(request.id, e.target.value)
                        }
                      />
                      <button onClick={() => handleReject(request.id)}>
                        Submit
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRequest;
