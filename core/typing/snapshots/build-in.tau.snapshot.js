module.exports = {types: {
 "typeMap": [
  {
   "Boolean": {
    "type": "FunctionType",
    "isRef": false,
    "isAtom": false,
    "arguments": [
     {
      "annotation": "unknown",
      "type": "ReferenceType",
      "isAtom": false,
      "isRef": true
     }
    ],
    "result": {
     "annotation": "boolean",
     "isAtom": true,
     "isRef": false,
     "type": "AtomType"
    }
   },
   "Number": {
    "type": "FunctionType",
    "isRef": false,
    "isAtom": false,
    "arguments": [
     {
      "annotation": "unknown",
      "type": "ReferenceType",
      "isAtom": false,
      "isRef": true
     }
    ],
    "result": {
     "annotation": "number",
     "isAtom": true,
     "isRef": false,
     "type": "AtomType"
    }
   },
   "String": {
    "type": "FunctionType",
    "isRef": false,
    "isAtom": false,
    "arguments": [
     {
      "annotation": "unknown",
      "type": "ReferenceType",
      "isAtom": false,
      "isRef": true
     }
    ],
    "result": {
     "annotation": "string",
     "isAtom": true,
     "isRef": false,
     "type": "AtomType"
    }
   },
   "nothingFunc": {
    "type": "FunctionType",
    "isRef": false,
    "isAtom": false,
    "arguments": [
     {
      "annotation": "unknown",
      "type": "ReferenceType",
      "isAtom": false,
      "isRef": true
     }
    ]
   },
   "consoleAssert": {
    "type": "FunctionType",
    "isRef": false,
    "isAtom": false,
    "arguments": [
     {
      "annotation": "boolean",
      "isAtom": true,
      "isRef": false,
      "type": "AtomType"
     },
     {
      "annotation": "unknown",
      "type": "ReferenceType",
      "isAtom": false,
      "isRef": true
     }
    ]
   },
   "console": {
    "type": "ObjectType",
    "isRef": false,
    "isAtom": false,
    "annotation": {
     "log": {
      "annotation": "nothingFunc",
      "type": "ReferenceType",
      "isAtom": false,
      "isRef": true
     },
     "assert": {
      "annotation": "consoleAssert",
      "type": "ReferenceType",
      "isAtom": false,
      "isRef": true
     }
    }
   }
  }
 ]
}}