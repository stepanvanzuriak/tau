const a = {
  c: 12,
  d: 'asd',
  k: true,
  g: {
    l: 12,
  },
};

a.c = 56;
a.k = false;

a.g.l = 'asdasd';

// EXPECT

[
  {
    loc: {
      end: {
        column: 17,
        line: 13,
      },
      start: {
        column: 0,
        line: 13,
      },
    },
    name: 'Type number is not match string',
  },
];
