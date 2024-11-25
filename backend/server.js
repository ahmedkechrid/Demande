import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({
  origin: ['http://localhost:5173', 'https://demande-3.onrender.com'], 
  credentials: true,
}));


app.options('*', cors());

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(bodyParser.json());

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM login WHERE email = ? AND password = ?';
  db.execute(sql, [email, password], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'An error occurred while executing the query' });
    }

    if (result.length > 0) {
      const user = result[0];
      const { name, email: userEmail, role, Id } = user;

      console.log('Retrieved role:', role);

      return res.status(200).json({ name, email: userEmail, role, Id });
    } else {
      return res.status(401).json({ status: 'Invalid email or password' });
    }
  });
});


app.get('/api/get-requests', (req, res) => {
  const name = req.query.name; // Retrieve the 'name' parameter from the request

  // Validate the name parameter
  if (!name) {
    return res.status(400).json({ error: 'User name is required' });
  }

  const sql = 'SELECT * FROM request WHERE nom_demandeur = ?';

  db.query(sql, [name], (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: 'An error occurred while fetching requests' });
    }

    // No requests found for the user
    if (results.length === 0) {
      return res.status(200).json({ requests: [] }); // Empty list if no requests
    }

    // Return the filtered requests to the client
    res.status(200).json({ requests: results });
  });
});


app.post('/api/submit-form', (req, res) => {
  const { hrs_demande, service, nom_demandeur, date_demande, transforme, ref_mat, designiation } = req.body;

  // Insert data into the database
  const sql = `INSERT INTO request (date, hrs_demande, service, nom_demandeur, date_demande, transforme, ref_mat, designiation)
               VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, ?);`;

  const values = [hrs_demande, service, nom_demandeur, date_demande, transforme, ref_mat, designiation];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ success: false, message: 'Error inserting data' });
    }

    res.status(200).json({ success: true, message: 'Data successfully inserted' });
  });
});

app.get('/api/requests', (req, res) => {
  const sql = 'SELECT * FROM request';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ success: false, message: 'Error fetching requests' });
    }
    res.status(200).json(result);
  });
});

app.post('/api/approve-request', (req, res) => {
  const { id } = req.body;
  const sql = 'UPDATE request SET status = "approved" WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error approving request:', err);
      return res.status(500).json({ success: false, message: 'Error approving request' });
    }
    res.status(200).json({ success: true, message: 'Request approved' });
  });
});

app.post('/api/reject-request', (req, res) => {
  const { id, commentaire } = req.body;

  if (!id || !commentaire) {
    return res.status(400).json({ message: 'ID and commentaire are required.' });
  }

  const query = 'UPDATE request SET status = ?, commentaire = ? WHERE id = ?';

  db.query(query, ['rejected', commentaire, id], (error, result) => {
    if (error) {
      console.error('Error processing reject request:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Request rejected successfully.' });
    } else {
      return res.status(404).json({ message: 'Request not found.' });
    }
  });
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
    });
  }
  

app.listen(8000, () => {
  console.log('Server started at port 8000');
});
