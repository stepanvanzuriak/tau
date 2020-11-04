import React from "react";

const BugsSection = ({
  simple,
  full,
  showTrace,
  playgroundValue,
  onShowMore,
}) => {
  return simple ? (
    <div className="bug-section">
      <h2>
        Looks like you found bug in Tau! Help us and submit it{' '}
        <a href="https://github.com/stepanvanzuriak/tau">here</a>
        <br />
        Please share this link:{' '}
        <a href={`${window.location.origin}?share=${btoa(playgroundValue)}`}>
          {`${window.location.origin}?share=${btoa(playgroundValue)}`}
        </a>
      </h2>
      <code className="bugs">{simple}</code>

      <button type="button" className="collapsible" onClick={onShowMore}>
        {showTrace ? <>Less</> : <>More</>}
      </button>
      <div className={showTrace ? 'content-visible' : 'content'}>
        <pre>{full}</pre>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default BugsSection;
