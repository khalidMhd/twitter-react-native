export function loginPasswordValidator(password) {
  const val = validatePassword(password);
  if (!password.trim()) return "Password can't be empty.";
  return '';
}

export function passwordValidator(password) {
  const val = validatePassword(password);
  if (!password.trim()) return "Password can't be empty.";
  if (password.length < 5)
    return 'Password must be at least 5 characters long.';
  if (!val)
    return 'Password contains at least one capital letter and one number';
    // return 'Password contains at least one alphabet, one digit, and one symbol';
  return '';
}

function validatePassword(password) {
 // var regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+-=])[A-Za-z\d!@#$%^&*()_+-=]{8,}$/;
  // alphabet, one digit, and one symbol
   var regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;  
  return regex.test(password);
}
