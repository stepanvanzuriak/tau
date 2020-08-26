import React, { useEffect, useState, useCallback } from 'react';
import { TauParser, TauValidator } from 'tau-core';
import * as monaco from 'monaco-editor';
import queryString from 'query-string';

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

  const onShareClick = useCallback(async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}?share=${btoa(playgroundValue)}`,
    );
    alert('Link copied to clickboard');
  }, [playgroundValue]);

  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    let value = "let a = 12;\na = 'wrong!';";

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    if (parsed.share) {
      value = atob(parsed.share);
      setPlaygroundValue(value);
    }

    const edt = monaco.editor.create(document.getElementById('editor'), {
      value,
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
              <br />
              Please share this link:{' '}
              <a
                href={`${window.location.origin}?share=${btoa(
                  playgroundValue,
                )}`}
              >
                {`${window.location.origin}?share=${btoa(playgroundValue)}`}
              </a>
            </h2>
            <code className="bugs">{bugs.simple}</code>

            <button type="button" className="collapsible" onClick={onShowMore}>
              {showTrace ? <>Less</> : <>More</>}
            </button>
            <div className={showTrace ? 'content-visible' : 'content'}>
              <pre>{bugs.full}</pre>
            </div>
          </div>
        )}

        <button onClick={onValidate}>Validate</button>

        <button className={styles['button-control']} onClick={onShowParserTree}>
          {showParserTree ? <>Hide</> : <>Show</>} AST
        </button>

        <button className={styles['button-control']} onClick={onShareClick}>
          Share
        </button>

        {showParserTree && (
          <code className={styles.ast}>{JSON.stringify(parserTree)}</code>
        )}
      </div>

      <div id="editor"></div>
    </>
  );
};

export default App;
