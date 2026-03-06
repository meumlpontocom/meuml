import React, { useContext } from "react";
import { CCardBody }         from "@coreui/react";
import { FaPhone }           from "react-icons/fa";
import { context }           from "src/views/WhatsAppConfig/context";

function SelectedTopics({ selectedTopics }) {
  const { whatsAppTopics } = useContext(context);

  return (
    <CCardBody>
      <p className="mt-2">Opções selecionadas:</p>
      <ul style={{ listStyle: "none", paddingLeft: "0px" }}>
        {selectedTopics.map(topic => {
          const topicName = whatsAppTopics.filter(t => t.key === topic)[0]?.name;
          return (
            <li key={topic}>
              <FaPhone /><span className="ml-2">{topicName}</span>
            </li>
          );
        })}
      </ul>
    </CCardBody>
  );
}

export default SelectedTopics;
