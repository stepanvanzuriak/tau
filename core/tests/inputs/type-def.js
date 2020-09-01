type a = string;
let a = 12; // Error here

type b = string;
let b = 'string';

type c = string;
let c = b;

// EXPECT

[
  {
    loc: {
      end: {
        column: 10,
        line: 2,
      },
      start: {
        column: 4,
        line: 2,
      },
    },
    name: 'Type string is not match number',
  },
];
