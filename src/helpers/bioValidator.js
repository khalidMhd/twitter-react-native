export function bioValidator(bio) {
  if (bio.length > 100)
    return 'Max 100 characters allowed.';
  return '';
}

