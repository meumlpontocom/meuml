import React                        from "react";
import { CListGroupItem }           from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDirectoryId }   from "../../../redux/actions/_newProductActions";

function Folder({ id, name }) {
  const dispatch = useDispatch();
  const setSelectedFolder = id => dispatch(setSelectedDirectoryId(id));
  const currentDirectoryID = useSelector(state => state.newProduct.images.currentDirectoryID);

  return (
    <CListGroupItem
      className={`list-group-item-action ${currentDirectoryID === id ? "active" : ""}`}
      onClick={() => setSelectedFolder(currentDirectoryID === id ? "" : id)}
      id={`${id}-list-group-item`}
    >
      <i className={`icon-fix mr-1 cil-folder${currentDirectoryID === id ? "-open" : ""}`}/>
      {name}
    </CListGroupItem>
  );
}

export default Folder;
