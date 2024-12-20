const service = require('../dbService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'aloha';

// Admin Login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await service.getAdmin(username);
    if (admin.length === 0 || !(await bcrypt.compare(password, admin[0].password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { adminId: admin[0].id, role: admin[0].role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error in adminLogin:', error.originalError || error.message);
    res.status(error.status || 500).send(error.message || 'An error occurred');
  }
};

// Create Customer
exports.createCustomer = async (req, res) => {
  const { name, url, portal_username, portal_password, secret_client_id, greeting_message, chatbot_prompt } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(portal_password, 10);
    const result = await service.createCustomer(
      name,
      url,
      portal_username,
      hashedPassword,
      secret_client_id,
      greeting_message,
      chatbot_prompt
    );

    res.status(201).send('Customer created successfully');
  } catch (error) {
    console.error('Error in createCustomer:', error.originalError || error.message);
    res.status(error.status || 500).send(error.message || 'Failed to create customer');
 q
  }
};

// Get Customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await service.getCustomers();
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error in getCustomers:', error.originalError || error.message);
    res.status(error.status || 500).send(error.message || 'Failed to retrieve customers');
  }
};

// Update Customer
exports.updateCustomers = async (req, res) => {
  const { name, url, portal_username, hashedPassword, secret_client_id, greeting_message, chatbot_prompt, id } = req.body;

  try {
    const result = await service.updateCustomers(
      name,
      url,
      portal_username,
      hashedPassword,
      secret_client_id,
      greeting_message,
      chatbot_prompt,
      id
    );

    res.status(200).send('Customer updated successfully');
  } catch (error) {
    console.error('Error in updateCustomers:', error.originalError || error.message);
    res.status(error.status || 500).send(error.message || 'Failed to update customer');
  }
};

// Delete Customer
exports.deleteCustomer = async (req, res) => {
  const { id } = req.body;

  try {
    const result = await service.deleteCustomer(id);
    res.send('Customer deleted successfully');
  } catch (error) {
    console.error('Error in deleteCustomer:', error.originalError || error.message);
    res.status(error.status || 500).send(error.message || 'Failed to delete customer');
  }
};

// Customer Login
exports.customerLogin = async (req, res) => {
  const { password, username } = req.body;
console.log(req.body);
  try {
    const customer = await service.getCustomer(username);
    console.log(customer);
    if (customer.length === 0 || !(await bcrypt.compare(password, customer[0].portal_password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { customerId: customer[0].id, role: customer[0].role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error in customerLogin:', error.originalError || error.message);
    res.status(error.status || 500).send(error.message || 'An error occurred during login');
  }
};

// Get Customer Portal Configuration
exports.customerPortal = async (req, res) => {
  const { customerId } = req.body;

  try {
    const customer = await service.customerPortal(customerId);
    if (!customer) {
      return res.status(404).send('Customer not found');
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error in customerPortal:', error.originalError || error.message);
    res.status(error.status || 500).send(error.message || 'Failed to retrieve customer portal configuration');
  }
};
