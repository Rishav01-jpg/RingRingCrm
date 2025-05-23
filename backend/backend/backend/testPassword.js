const bcrypt = require('bcryptjs');

// Correct password and the hashed password stored in the database
const password = 'newpassword123'; // The password user entered
const hashedPasswordFromDB = '$2b$10$NwWs96C9Lfg/ExD/fyfOsOWQCBQoatt2F2uws0mqGPElHIUje49l6'; // The hashed password from your DB

// Compare the entered password with the hashed password
bcrypt.compare(password, hashedPasswordFromDB)
  .then(isMatch => {
    console.log('Password match status:', isMatch); // Should print true if passwords match
  })
  .catch(err => {
    console.error('Error comparing passwords:', err);
  });
