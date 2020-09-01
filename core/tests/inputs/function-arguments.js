type scope = (string, string) => number;
function scope(a, b) {
  a = 12; // Error here
}

// EXPECT

[
  {
    loc: {
      end: {
        column: 9,
        line: 3,
      },
      start: {
        column: 2,
        line: 3,
      },
    },
    name: 'Type string is not match number',
  },
];
