let num1 = 12;
let num2 = 13;
let num3 = 0;
let string = 'wrong';

num1 = num2;

num1 = string; // Error here

num3 = 45;

// EXPECT

[
  {
    loc: { end: { column: 14, line: 8 }, start: { column: 0, line: 8 } },
    name: 'Type number is not match string',
  },
];
