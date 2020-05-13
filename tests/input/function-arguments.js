type scope = (string, string) => number;
function scope(a, b) {
  a = 12; // Error here
}
