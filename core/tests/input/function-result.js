type scope = (string, string) => number;
function scope(a, b) {
  return a; // Error here
}
