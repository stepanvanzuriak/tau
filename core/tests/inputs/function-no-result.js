type f = (number, number);
const f = function(a, b) {const c = a + b};

let k = f(12, "str");

// EXPECT

[
  {
    loc: {
      end: {
        column: 20,
        line: 4,
      },
      start: {
        column: 8,
        line: 4,
      },
    },
    name: 'Argument string is not match number',
  },
];
