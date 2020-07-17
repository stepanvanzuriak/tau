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
