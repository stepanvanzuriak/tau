type a = Array(number);
let a = [1, 2, 3];

a = ["1", "2", "3"];

// EXPECT

[
  {
    loc: {
      start: {
        column: 0,
        line: 4,
      },
      end: { column: 20, line: 4 },
    },

    name: 'Type Array(number) is not match Array(string)',
  },
];
