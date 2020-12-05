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
   "console": {
    "type": "ObjectType",
    "isRef": false,
    "isAtom": false,
    "annotation": {
     "log": {
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
     "assert": {
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
     }
    }
   },
   "Math": {
    "type": "ObjectType",
    "isRef": false,
    "isAtom": false,
    "annotation": {
     "random": {
      "type": "FunctionType",
      "isRef": false,
      "isAtom": false,
      "arguments": [],
      "result": {
       "annotation": "number",
       "isAtom": true,
       "isRef": false,
       "type": "AtomType"
      }
     },
     "floor": {
      "type": "FunctionType",
      "isRef": false,
      "isAtom": false,
      "arguments": [
       {
        "annotation": "number",
        "isAtom": true,
        "isRef": false,
        "type": "AtomType"
       }
      ],
      "result": {
       "annotation": "number",
       "isAtom": true,
       "isRef": false,
       "type": "AtomType"
      }
     }
    }
   }
  }
 ]
}}