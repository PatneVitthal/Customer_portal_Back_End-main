// Import required modules
const dotenv = require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');

const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


// Create an Express application
const app = express();
const router = require('./routes/apiRoutes');

app.use(cors());

app.use(express.json());
app.use('/api', router); // Use the router for all `/api` routes
const PORT = process.env.PORT || 3000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',      // Database host
  user: 'root',           // Your database user
  password: 'Mobile@123', // Your database password
  database: 'storedetails', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route to handle file upload and CSV parsing
app.post('/v1/upload', upload.single('file'), (req, res) => {
  
  const file = req.file;

  if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = file.path;
  const stores = [];

  // Read the CSV file and parse its content
  fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
          // Add parsed data to the array
          stores.push({
              name: row.name,
              display_name: row.display_name,
              address: row.Address,
              latitude: parseFloat(row.latitude),
              longitude: parseFloat(row.longitude),
              fax: row.fax,
              email: row.email,
              sun_facing_amt: row.sun_facing_amt,
              optical_facing_amt: row.optical_facing_amt,
              phone_number: row.phone_number,
              monday_time: row.monday_time,
              tuesday_time: row.tuesday_time,
              wednesday_time: row.wednesday_time,
              thursday_time: row.thursday_time,
              friday_time: row.friday_time,
              saturday_time: row.saturday_time,
              sunday_time: row.sunday_time,
          });
      })
      .on('end', () => {
          if (stores.length === 0) {
              // Return if no data was found
              return res.status(400).json({ message: 'No valid data found in the file.' });
          }

          // Insert parsed data into the database
          const query = `
  INSERT INTO store 
  (name, display_name, Address, latitude, longitude, fax, email, sun_facing_amt, 
  optical_facing_amt, phone_number, monday_time, tuesday_time, wednesday_time, 
  thursday_time, friday_time, saturday_time, sunday_time, updated_at) 
  VALUES ? 
  ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    Address = VALUES(Address),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    fax = VALUES(fax),
    email = VALUES(email),
    sun_facing_amt = VALUES(sun_facing_amt),
    optical_facing_amt = VALUES(optical_facing_amt),
    phone_number = VALUES(phone_number),
    monday_time = VALUES(monday_time),
    tuesday_time = VALUES(tuesday_time),
    wednesday_time = VALUES(wednesday_time),
    thursday_time = VALUES(thursday_time),
    friday_time = VALUES(friday_time),
    saturday_time = VALUES(saturday_time),
    sunday_time = VALUES(sunday_time),
    updated_at = CURRENT_TIMESTAMP;
`;


const values = stores.map(store => [
  store.name, store.display_name, store.address, store.latitude,
  store.longitude, store.fax, store.email, store.sun_facing_amt,
  store.optical_facing_amt, store.phone_number, store.monday_time,
  store.tuesday_time, store.wednesday_time, store.thursday_time,
  store.friday_time, store.saturday_time, store.sunday_time,
  new Date() // Ensure updated_at is set to the current timestamp for inserts
]);


          pool.query(query, [values], (err) => {
              if (err) {
                  console.error('Database query failed:', err);
                  return res.status(500).json({ message: 'Database error.', error: err.message });
              }
              // Send success response
              return res.status(200).json({ message: 'File uploaded and data inserted into the database successfully.' });
          });
      })
      .on('error', (err) => {
          console.error('Error reading CSV file:', err);
          return res.status(500).json({ message: 'Error reading CSV file.', error: err.message });
      });
});


// Route to handle request with a query parameter
app.get('/v1/findStore', (req, res) => {
  const { minLat, maxLat, minLong, maxLong } = req.query;

  // Validate query parameters
  if (!minLat || !minLong || !maxLat || !maxLong) {
    return res.status(400).json({ error: 'Latitude and longitude range is required' });
  }

  const latMinusOne = parseFloat(minLat);
  const latPlusOne = parseFloat(maxLat);
  const longMinusOne = parseFloat(minLong);
  const longPlusOne = parseFloat(maxLong);

  const query = `
    SELECT * 
    FROM store
    WHERE latitude BETWEEN ? AND ?
      AND longitude BETWEEN ? AND ?
  `;

  pool.execute(query, [latMinusOne, latPlusOne, longMinusOne, longPlusOne], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(results);
  });
});

app.get('/v1/recentStores', (req, res) => {
  const query = `
    SELECT * 
    FROM store 
    WHERE updated_at >= NOW() - INTERVAL 5 MINUTE
  `;

  pool.execute(query, [], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    res.status(200).json(results);
  });
});



app.get('/v1/allStoreDetails', (req, res) => {
  const query = `
    SELECT * 
    FROM store
  `;

  pool.execute(query, [], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    res.status(200).json(results);
  });
});

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
