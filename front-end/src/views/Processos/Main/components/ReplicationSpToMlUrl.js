import React from "react";

const ReplicationSpToMlUrl = ({ initialSentence, url, lastSentence }) => {
  return (
    <span>
      {initialSentence}&nbsp;
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>&nbsp;
      {lastSentence}
    </span>
  );
};

export default ReplicationSpToMlUrl;
