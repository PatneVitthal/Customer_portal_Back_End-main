const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const controller = require('../controllers/portalController'); 
//const GuidedSearchAi = require('../controllers/guidedSearchAIController');

// JWT Secret
const JWT_SECRET = 'aloha';

// Middleware for Authentication
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send('Token is required');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(403).send('Invalid or expired token');
  }
}

function authenticateCustomer(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send('Token is required');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.customerId = decoded.customerId;
    next();
  } catch (error) {
    res.status(403).send('Invalid or expired token');
  }
}

// Admin Routes
router.post('/admin/login', controller.adminLogin); // Public
router.post('/customers', authenticateAdmin, controller.createCustomer); // Secured
router.get('/customers', authenticateAdmin, controller.getCustomers); // Secured
router.put('/customers', authenticateAdmin, controller.updateCustomers); // Secured
router.delete('/customers', authenticateAdmin, controller.deleteCustomer); // Secured

// Customer Routes
router.post('/customer/login', controller.customerLogin); // Public
router.get('/customer/portal', authenticateCustomer, controller.customerPortal); // Secured



//GuidedsearchAi


module.exports = router;

