let a = 12;
let b = 'asdasd';

a = b; // Error here

function test() {
  let a = 12;
  let b = 45;

  b = 67;

  a = b; // Error here
}
