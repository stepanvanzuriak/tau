type c = (string) => string;
let c = function (s) {
  return s;
};

let d = c(12)


// EXPECT

[
    {
    loc: {
      end: {
        column: 13,
        line: 6,
      },
      start: {
        column: 8,
        line: 6,
      },
    },
    name: 'Argument number is not match string',
  }
];
