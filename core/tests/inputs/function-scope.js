let a = 12;

a = 45;

function scope() {
  let a = 'str';

  a = 'str';

  function deep() {
    let a = 12;

    a = 67;

    function deeper() {
      let a = true;

      a = false;
    }
  }
}

let c = 89;

// EXPECT

[];
