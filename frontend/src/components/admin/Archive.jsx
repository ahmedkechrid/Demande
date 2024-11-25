import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Archive.css';
import Logo from '../../assets/wkwlogo.png'
import {Link} from 'react-router-dom'

const ArchivePage = () => {
  const [requests, setRequests] = useState([]);

  // Fetch all requests (both approved and rejected)
  useEffect(() => {
    axios.get('http://localhost:8000/api/requests') // Ensure this endpoint fetches all requests
      .then(response => {
        const formattedRequests = response.data.map(request => {
          const date = new Date(request.date_demande);
          const formattedDate = date.toISOString().split('T')[0];
          return {
            ...request,
            date_demande: formattedDate
          };
        });
        setRequests(formattedRequests);
      })
      .catch(err => {
        console.error('Error fetching all requests:', err);
      });
  }, []);

  return (
    <div className="archive-page">
  
      <header className="admin-header">
        <div className="logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h1 className='title-admin'>Archive</h1>

        <div className="header-buttons">
          <Link to="/AdminRequest" className="archive-button">
            Retour
          </Link>

        </div>
      </header>
  

      <table className="archive-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Service</th>
            <th>Nom Demandeur</th>
            <th>Date Demande</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.service}</td>
              <td>{request.nom_demandeur}</td>
              <td>{request.date_demande}</td>
              <td>{request.status || 'Pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArchivePage;
