export function nameValidator(name) {
  var regex = /[^a-zA-Z\s]/;

  if (!name.trim()) return " can't be empty.";

  // Check if the input string matches the regular expression
  if (regex.test(name)) {
    return 'Enter only alphabet characters';
  } else {
    return '';
  }
  return '';
}

export function nameValidatorUpd(name) {
  var regex = /[^a-zA-Z\s]/;
  // Check if the input string matches the regular expression
  if (regex.test(name)) {
    return 'Enter only alphabet characters';
  } else {
    return '';
  }
  return '';
}
