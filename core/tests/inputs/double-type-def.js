type a = number;
type a = string; // Error here
let a = 12;

// EXPECT

[
  {
    loc: {
      end: {
        column: 16,
        line: 2,
      },
      start: {
        column: 0,
        line: 2,
      },
    },
    name: 'Double declaration number before and string here',
  },
];
