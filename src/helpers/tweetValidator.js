export function tweetValidator(tweet) {
  if (!tweet.trim()) return "Tweet can't be empty.";
  if (tweet.length > 180)
    return 'Max 180 characters allowed';
  return '';
}
