import React from "react";

const ReplicationMsgUrl = ({
  bracketSplit,
  originalAdvertUrl,
  originalAdvertId,
  replicationUrl,
  replicationId,
  finalSentence,
}) => {
  return (
    <>
      <span className="text-dark">{bracketSplit[0]}</span>
      <a href={originalAdvertUrl} rel="noopener noreferrer" target="_blank">
        {originalAdvertId}
      </a>
      <span className="text-dark mr-1 ml-1">{"->"}</span>
      <a href={replicationUrl} rel="noopener noreferrer" target="_blank">
        {replicationId}
      </a>
      <span className="text-dark">: {finalSentence}</span>
    </>
  );
};

export default ReplicationMsgUrl;
