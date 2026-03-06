import React, { useEffect, useMemo }                                      from "react";
import PropTypes                                                          from "prop-types";
import { useDispatch, useSelector }                                       from "react-redux";
import styles                                                             from "../styles.module.scss";
import { setImageStorePaginationCleanup, setImageStorePictureIsSelected } from "src/redux/actions";

const FolderContent = ({ id }) => {
  const dispatch = useDispatch();
  const { images, selectedPictures, selectAllPictures } = useSelector(state => state.imageStorage.files);
  const isOpen = useSelector(state => state.imageStorage.files.folders.filter(folder => folder.id === id)[0]?.isSelected);

  useEffect(() => {
    if (!isOpen)
      dispatch(setImageStorePaginationCleanup());
  }, [dispatch, isOpen]);

  const Picture = ({ image }) => {
    const checked = useMemo(() => {
      if (!selectAllPictures) return !!selectedPictures.filter(picId => picId === image.id).length;
      else return !!!selectedPictures.filter(picId => picId === image.id).length;
    }, [image.id]);

    function setPictureIsChecked() {
      dispatch(setImageStorePictureIsSelected(image.id, !checked));
    }

    return (
      <div className={`pointer ${styles.subFolder} ${checked ? styles.selectedImg : ""}`} onClick={setPictureIsChecked}>
        <p className="mb-0">
          <i className={`cil-${checked ? "check" : "image"} mr-2 icon-fix`}/>
          {image.name}
        </p>
      </div>
    );
  };

  return !isOpen ? <></> : (
    images.length
    ? images
      .filter(img => img.parent_id === id)
      .map((image) => (<Picture image={image} key={image.id}/>))
    : <></>
  );
};

FolderContent.propTypes = {
  id: PropTypes.number.isRequired,
};

export default FolderContent;
