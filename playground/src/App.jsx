import React, { useEffect, useState, useCallback } from 'react';
import { TauParser, TauValidator } from 'tau-core';
import * as monaco from 'monaco-editor';

import styles from './App.modules.css';

const App = () => {
  const [playgroundValue, setPlaygroundValue] = useState(
    "let a = 12;\na = 'wrong!';",
  );

  const [editor, setEditor] = useState(null);
  const [showTrace, setShowTrace] = useState(false);
  const [parserTree, setParserTree] = useState({});
  const [showParserTree, setShowParserTree] = useState(false);
  const [bugs, setBugs] = useState({ simple: '', full: '' });

  const onValidate = useCallback(() => {
    if (editor) {
      let warnings = [];

      try {
        const ast = TauParser(playgroundValue);
        setParserTree(ast);
        warnings = TauValidator(ast);
      } catch (e) {
        setBugs({ simple: e.toString(), full: e.stack });
      }

      monaco.editor.setModelMarkers(
        editor.getModel(),
        'Tau',
        warnings.map((el) => ({
          startLineNumber: el.loc.start.line,
          startColumn: el.loc.start.column + 1,
          endLineNumber: el.loc.end.line + 1,
          endColumn: el.loc.end.column,
          message: el.name,
          severity: monaco.MarkerSeverity.Warning,
        })),
      );
    }
  }, [editor, playgroundValue]);

  const onShowParserTree = useCallback(() => {
    setShowParserTree((prev) => !prev);
  });

  const onShowMore = useCallback(() => {
    setShowTrace((prev) => !prev);
  }, []);

  useEffect(() => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    const edt = monaco.editor.create(document.getElementById('editor'), {
      value: "let a = 12;\na = 'wrong!';",
      language: 'javascript',
    });

    edt.onDidChangeModelContent(() => {
      setPlaygroundValue(edt.getValue());
      setBugs(false);
    });

    setEditor(edt);
  }, []);

  return (
    <>
      <div className="playground-header">
        <h2>Tau Playground</h2>
        {bugs.simple && (
          <div className="bug-section">
            <h2>
              Looks like you found bug in Tau! Help us and submit it{' '}
              <a href="https://github.com/stepanvanzuriak/tau">here</a>
            </h2>
            <code className="bugs">{bugs.simple}</code>

            <button type="button" className="collapsible" onClick={onShowMore}>
              More info
            </button>
            <div className={showTrace ? 'content-visible' : 'content'}>
              <pre>{bugs.full}</pre>
            </div>
          </div>
        )}
        <br />
        <button onClick={onValidate}>Validate</button>

        <button className={styles['ast-button']} onClick={onShowParserTree}>
          {showParserTree ? <>Hide</> : <>Show</>} AST
        </button>
        <br />
        {showParserTree && <code>{JSON.stringify(parserTree)}</code>}
      </div>

      <div id="editor"></div>
    </>
  );
};

export default App;
