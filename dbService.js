const db = require('./dbConfig');

// Helper function for error handling
function handleDbError(error, customMessage = 'Database operation failed') {
  console.error('DB Error:', error.message || error);
  return { status: 500, message: customMessage, originalError: error };
}

// Admin login
async function getAdmin(username) {
  try {
    const sql = 'SELECT * FROM admin WHERE username = ?';
    const [admin] = await db.execute(sql, [username]);
    return admin;
  } catch (error) {
    throw handleDbError(error, 'Failed to retrieve admin details');
  }
}

// Create a new customer
async function createCustomer(name, url, portal_username, portal_password, secret_client_id, greeting_message, chatbot_prompt) {
  try {
    const sql = `INSERT INTO customer (name, url, portal_username, portal_password, secret_client_id, greeting_message, chatbot_prompt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [name, url, portal_username, portal_password, secret_client_id, greeting_message, chatbot_prompt]);
    return result;
  } catch (error) {
    throw handleDbError(error, 'Failed to create customer');
  }
}

// Retrieve all customers
async function getCustomers() {
  try {
    const [customers] = await db.execute('SELECT * FROM customer');
    return customers;
  } catch (error) {
    throw handleDbError(error, 'Failed to retrieve customers');
  }
}

// Update a customer
async function updateCustomers(name, url, portal_username, hashedPassword, secret_client_id, greeting_message, chatbot_prompt) {
  try {
    await db.execute(
      `UPDATE customer SET name = ?, url = ?, portal_password = ?, secret_client_id = ?, greeting_message = ?, chatbot_prompt = ? WHERE portal_username = ?`,
      [name, url, hashedPassword, secret_client_id, greeting_message, chatbot_prompt, portal_username]
    );
    return { message: 'Customer updated successfully' };
  } catch (error) {
    throw handleDbError(error, 'Failed to update customer');
  }
}

// Delete a customer
async function deleteCustomer(portal_username) {
  try {
    await db.execute('DELETE FROM customer WHERE portal_username = ?', [portal_username]);
    return { message: 'Customer deleted successfully' };
  } catch (error) {
    throw handleDbError(error, 'Failed to delete customer');
  }
}

// Retrieve a customer by username
async function getCustomer(portal_username) {
  console.log(portal_username);
  try {
    const [customer] = await db.execute('SELECT * FROM customer WHERE portal_username = ?', [portal_username]);
    return customer;
  } catch (error) {
    console.log(error);
    throw handleDbError(error, 'Failed to retrieve customer details');
  }
}

// Retrieve a customer's portal configuration
async function customerPortal(portal_username) {
  try {
    const [customer] = await db.execute('SELECT name, url, greeting_message, chatbot_prompt FROM customer WHERE portal_username = ?', [portal_username]);
    return customer[0];
  } catch (error) {
    throw handleDbError(error, 'Failed to retrieve customer portal configuration');
  }
}


// Guided Search services 

async function getCategories(){
  try{
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY priority ASC');
    return categories;

  }catch(error){
    console.log(error);
    throw handleDbError(error,'failed to get Categories');
  }

} 

async function getAttributes(){
  try{
    const [attributes] = await db.execute('SELECT * FROM attributes');
    return attributes;

  }catch(error){
    console.log(error);
    throw handleDbError(error,'failed to get attributes');
  }

} 

module.exports = {
  getAdmin,
  createCustomer,
  getCustomers,
  updateCustomers,
  deleteCustomer,
  getCustomer,
  customerPortal,
  //guidedSearch Service
  getCategories, 
  getAttributes
};
