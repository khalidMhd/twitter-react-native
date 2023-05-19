export function numberValidator(number) {
  const re = /^[0-9]+$/
  if (number.length < 11)
  return 'Min 11 digit allowed';
  if (number.length > 11)
  return 'Max 11 digit allowed';
  if (number && !re.test(number)) return 'Enter only digit'
  return '';
}
