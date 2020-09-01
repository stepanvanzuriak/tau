type a = () => string;
const a = () => 12; // Error here

// EXPECT

[
  {
    loc: {
      end: {
        column: 18,
        line: 2,
      },
      start: {
        column: 6,
        line: 2,
      },
    },
    name: 'Type number is expected, but string is returned',
  },
];
