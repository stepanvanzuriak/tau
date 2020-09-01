type GlobalType = number;

type a = number;
let a = 12;

function scope() {
  type b = GlobalType;
  let b = 12;

  function deep() {
    type c = b;
    let c = 'string'; //Error here
  }
}

// EXPECT

[
  {
    loc: {
      end: {
        column: 20,
        line: 12,
      },
      start: {
        column: 8,
        line: 12,
      },
    },
    name: 'Type number is not match string',
  },
];
