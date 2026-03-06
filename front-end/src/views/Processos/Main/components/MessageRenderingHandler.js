import React, { memo }      from 'react'
import ReplicationMsgUrl    from './ReplicationMsgUrl';
import ReplicationSpToMlUrl from './ReplicationSpToMlUrl';

const MessageRenderingHandler = ({ message }) => {
  try {
    if (message.search("Replicação de Anúncio") > -1) {
      const bracketSplit      = message.split("$[");
      const keySplit          = message.split("${");
      const colonSplit        = message.split(":");
      const originalAdvertUrl = bracketSplit[1].split("]")[0];
      const replicationUrl    = bracketSplit[2].split("]")[0];
      const finalSentence     = colonSplit[3];
      const originalAdvertId  = keySplit[1].split("}")[0];
      const replicationId     = keySplit[2].split("}")[0];
      return (
        <ReplicationMsgUrl
          bracketSplit={bracketSplit}
          finalSentence={finalSentence}
          originalAdvertId={originalAdvertId}
          originalAdvertUrl={originalAdvertUrl}
          replicationId={replicationId}
          replicationUrl={replicationUrl}
        />
      );
    } else return message;
  } catch (error) {
    try {
      const url             = message.split("$[")[1].split("]")[0];
      const initialSentence = message.split("$[")[0];
      const lastSentence    = message.split("$[")[1].split("]")[1];
      return (
        <ReplicationSpToMlUrl initialSentence={initialSentence} url={url} lastSentence={lastSentence} />
      );
    } catch (error) {
      console.log(error);
      return message;
    }
  }
}

export default memo(MessageRenderingHandler);