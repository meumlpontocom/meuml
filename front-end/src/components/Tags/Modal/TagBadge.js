import React from "react";
import { Badge } from "reactstrap";
// import requests from "../requests";
import { useDispatch, useSelector } from "react-redux";
// import getSelectedAdverts from "../getSelectedAdverts";
import { hideTag } from "../../../redux/actions/_tagsActions";

const TagBadge = ({ tagName, tagId, color }) => {
  const dispatch = useDispatch();
  const { hiddenTags } = useSelector((state) => state.tags);

  function removeTag() {
    dispatch(hideTag({ name: tagName, id: tagId }));
  }

  const hidden = React.useMemo(() => {
    if (hiddenTags?.find(({ name }) => name === tagName)) return true;
    return false;
  }, [hiddenTags, tagName]);

  return !hidden ? (
    <li className="mx-1 list-inline-item">
      <Badge color={color || "primary"}>
        <p className="m-0">
          {tagName}{" "}
          <span size="sm" className="badge-close-button" onClick={removeTag}>
            <i className="cil-x" />
          </span>
        </p>
      </Badge>
    </li>
  ) : (
    <></>
  );
};

export default TagBadge;
