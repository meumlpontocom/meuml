import React                        from "react";
import styles                       from "./styles.module.scss";
import FolderContent                                               from "./FolderContent";
import { setImageStorageClearImageSelection, setIsFolderSelected } from "src/redux/actions";
import { useDispatch, useSelector }                                from "react-redux";

const ImagesFolder = ({ id }) => {
    const dispatch = useDispatch();
    const folder = useSelector(state => state.imageStorage.files.folders.filter(folder => folder.id === id)[0]);
    const setIsOpen = boolean => dispatch(setIsFolderSelected(id, boolean));
    function handleClick() {
      setIsOpen(!folder.isSelected);
      dispatch(setImageStorageClearImageSelection());
    }
    return (
      <div className={styles.folderCard}>
        <div
          onClick={handleClick}
          className={`d-flex justify-content-start align-items-center flex-wrap ${styles.pointer}`}
        >
          <i className={`${!folder.isSelected ? "cil-chevron-right" : "cil-chevron-bottom"} mr-1 ml-1`}/>
          <i className={`${!folder.isSelected ? "cil-folder" : "cil-folder-open"} mr-2`}/>
          <h6 className="mt-2">{folder.name}</h6>
        </div>
        <FolderContent id={folder.id}/>
      </div>
    );
  }
;

export default ImagesFolder;
