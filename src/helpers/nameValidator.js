export function nameValidator(name) {
  const re = /^[a-zA-Z]+$/

  if (!name.trim()) return " can't be empty.";
  if (!re.test(name)) return 'Enter only alphabet characters'
  return '';
}

export function nameValidatorUpd(name) {
  const re = /^[a-zA-Z]+$/
  if (!re.test(name)) return 'Enter only alphabet characters'
  return '';
}
