type SuperGlobalType = number;

type GlobalType = SuperGlobalType;

type a = GlobalType;
let a = 12;

type b = a;
let b = 12;

// EXPECT

[];
