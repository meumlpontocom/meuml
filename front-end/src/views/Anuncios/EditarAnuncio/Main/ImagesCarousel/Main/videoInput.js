import React from "react";
import { useSelector, useDispatch } from "react-redux";
//Reactstrap
import Input from "reactstrap/lib/Input";
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupText from "reactstrap/lib/InputGroupText";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import { updateFormData } from "../../../../../../redux/actions/_editAdvertActions";

const VideoInput = () => {
  const dispatch = useDispatch();
  const {
    form: { video_id },
  } = useSelector(({ editAdvert }) => editAdvert);

  function setVideoUrl(string) {
    dispatch(updateFormData("video_id", string));
  }

  return (
    <div>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-movie" />
          </InputGroupText>
        </InputGroupAddon>
        <Input
          type="text"
          value={video_id}
          placeholder="www.youtube.com/exemplo"
          onChange={({ target }) => setVideoUrl(target.value)}
        />
      </InputGroup>
    </div>
  );
};

export default VideoInput;
