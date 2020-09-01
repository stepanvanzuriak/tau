type scope = (string, string) => number;
function scope(a, b) {
  return a; // Error here
}

// EXPECT

[
  {
    loc: {
      end: {
        column: 11,
        line: 3,
      },
      start: {
        column: 2,
        line: 3,
      },
    },
    name: 'Type number is expected, but string is returned',
  },
];
