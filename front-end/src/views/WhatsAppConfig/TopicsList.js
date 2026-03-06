import React, { useContext } from "react";
import Topic                 from "./Topic";
import styled                from "styled-components";
import { context }           from "src/views/WhatsAppConfig/context";

const TopicsList = () => {
  const { whatsAppTopics, selectedTopics, setSelectedTopics } = useContext(context);

  function handleChangeCheckBox(e) {
    const clickedTopic = e.target;
    if (clickedTopic.checked) {
      setSelectedTopics([...selectedTopics, clickedTopic.value]);
    } else {
      const updatedSelectedTopics = selectedTopics.filter((selectedTopic) => selectedTopic !== clickedTopic.value);
      setSelectedTopics(updatedSelectedTopics);
    }
  }

  return (
    <TopicsListStyles>
      {whatsAppTopics.map((topic) => (
        <Topic
          key={topic.key}
          topic={topic}
          handleChange={handleChangeCheckBox}
        />
      ))}
    </TopicsListStyles>
  );
};

export default TopicsList;

const TopicsListStyles = styled.div`
  user-select: none;
  margin-left: -18px;

  svg polygon {
    fill: #fff;
  }

  .form-check input {
    visibility: hidden;
  }

  .form-check label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
    background-color: #fff;
    padding: 12px;
    border: 1px solid #ebedef;
    border-radius: 0.25rem;

    margin-bottom: 10px;
  }

  .form-check label:hover {
    border-color: #321fdb;
  }

  .form-check input:checked ~ label {
    color: #fff;
    background-color: #321fdb;
  }
`;
