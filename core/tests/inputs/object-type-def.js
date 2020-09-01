type a = { c: string, d: number };
const a = {};

a.c = 'asdasd';
a.d = 'asdasd';

// EXPECT

[
  {
    loc: {
      end: {
        column: 15,
        line: 5,
      },
      start: {
        column: 0,
        line: 5,
      },
    },
    name: 'Type number is not match string',
  },
];
