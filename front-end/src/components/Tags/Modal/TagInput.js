import React from "react";
import { Input, InputGroup, InputGroupAddon, InputGroupText } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { saveModalInputValue, createNewTag } from "../../../redux/actions/_tagsActions";
import { toast } from "react-toastify";

const TagInput = () => {
  const dispatch = useDispatch();
  const { modalInputValue, isLoading } = useSelector(({ tags: { modalInputValue, tags } }) => ({
    modalInputValue,
    tags,
  }));

  function handleChange({ target: { value } }) {
    dispatch(saveModalInputValue(value));
  }

  function handleSubmit() {
    if (!isLoading && modalInputValue) {
      const tagList = modalInputValue.split(",");
      dispatch(createNewTag([...new Set(tagList)]));
      dispatch(saveModalInputValue(""));
    } else {
      toast("Você não pode criar tags em branco.", {
        type: "warning",
        closeOnClick: false,
        autoClose: 5000,
        position: "top-right",
      });
    }
  }

  function handleOnBlurSubmit() {
    if (!isLoading && modalInputValue) {
      const tagList = modalInputValue.split(",");
      dispatch(createNewTag([...new Set(tagList)]));
      dispatch(saveModalInputValue(""));
    }
  }

  return (
    <InputGroup className="w-100">
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <i className="cil-tags " />
        </InputGroupText>
      </InputGroupAddon>
      <Input
        onKeyPress={({ key }) => key.toString() === "Enter" && handleSubmit()}
        onBlur={handleOnBlurSubmit}
        type="text"
        name="tag"
        id="tagString"
        placeholder="digite as tags"
        value={modalInputValue}
        onChange={handleChange}
      />
    </InputGroup>
  );
};

export default TagInput;
