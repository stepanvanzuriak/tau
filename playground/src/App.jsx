import React, { useEffect } from 'react';
import * as monaco from 'monaco-editor';

const App = () => {
  useEffect(() => {
    const edt = monaco.editor.create(document.getElementById('editor'), {
      value: "function hello() {\n\talert('Hello world!');\n}",
      language: 'javascript',
    });

    edt.onDidChangeModelContent(() => {
      console.log(edt.getValue());
    });
  }, []);

  return (
    <>
      <h2>Tau Playground</h2>
      <div id="editor"></div>
    </>
  );
};

export default App;
