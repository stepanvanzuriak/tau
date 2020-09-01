let edge = () => 12;

const b = {
  a: edge,
};

let k = 'Str';

k = b.a();

// EXPECT

[
  {
    loc: {
      end: {
        column: 10,
        line: 9,
      },
      start: {
        column: 0,
        line: 9,
      },
    },
    name: 'Type string is not match number',
  },
];
