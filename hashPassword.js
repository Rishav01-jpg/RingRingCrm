const bcrypt = require('bcryptjs');
const password = 'newpassword123';  // Your new password

bcrypt.hash(password, 10).then(hashedPassword => {
    console.log(hashedPassword);  // This will print the hashed password
});
