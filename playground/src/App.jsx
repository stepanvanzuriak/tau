import React, { useEffect, useState, useCallback } from 'react';
import { TauParser, TauValidator } from 'tau-core';
import * as monaco from 'monaco-editor';
import queryString from 'query-string';
import Modal from 'react-modal';

import { DEFAULT_CODE } from './constants';
import BugsSection from './components/BugsSection/index.jsx';
import Ast from './components/Ast/index.jsx';

import styles from './App.modules.css';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '20%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
};

const App = () => {
  const [playgroundValue, setPlaygroundValue] = useState(DEFAULT_CODE);

  const [editor, setEditor] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
        warnings = TauValidator(ast).errors;
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

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const onShowParserTree = useCallback(() => {
    setShowParserTree((prev) => !prev);
  }, []);

  const onShowMore = useCallback(() => {
    setShowTrace((prev) => !prev);
  }, []);

  const onShareClick = useCallback(async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}?share=${encodeURIComponent(
        btoa(playgroundValue),
      )}`,
    );
    setShowModal(true);
  }, [playgroundValue]);

  const onSaveAst = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(parserTree));

    setShowModal(true);
  }, [parserTree]);

  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    let value = DEFAULT_CODE;

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
      theme: 'vs-dark',
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
        <h1>Tau Playground</h1>
        <BugsSection
          playgroundValue={playgroundValue}
          showTrace={showTrace}
          onShowMore={onShowMore}
          {...bugs}
        />

        <button onClick={onValidate}>✔️ Validate</button>

        <button className={styles['button-control']} onClick={onShowParserTree}>
          📄 {showParserTree ? <>Hide</> : <>Show</>} AST
        </button>

        <button className={styles['button-control']} onClick={onShareClick}>
          🔗 Share
        </button>

        {showParserTree && (
          <Ast
            className={styles.ast}
            parserTree={parserTree}
            onSaveAst={onSaveAst}
          />
        )}
      </div>

      <div id="editor"></div>

      <Modal
        isOpen={showModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Example Modal"
        style={customStyles}
      >
        <div>Copied to clipboard!</div>
        <button className={styles.modalClose} onClick={closeModal}>
          Close
        </button>
      </Modal>
    </>
  );
};

export default App;
