import React, { useEffect, useState }              from "react";
import Folder                                      from "./Folder";
import getWidth                                    from "src/helpers/getWindowWidth";
import { listFiles }                               from "../../ImagesStore/requests";
import SearchFileInput                             from "./SearchFileInput";
import { useDispatch, useSelector }                from "react-redux";
import { CListGroup, CListGroupItem, CPagination } from "@coreui/react";
import {
  setCurrentDirectoryImages,
  setIsImagesLoading,
  setPagination
}                                                  from "src/redux/actions/_newProductActions";

function Folders() {
  const dispatch = useDispatch();
  const setLoading = boolean => dispatch(setIsImagesLoading(boolean));
  const directories = useSelector(state => state.newProduct.images.directories);
  const pagination = useSelector(state => state.newProduct.images.pagination);
  const currentDirectoryID = useSelector(state => state.newProduct.images.currentDirectoryID);
  const currentDirectoryImages = useSelector(state => state.newProduct.images.currentDirectoryImages);
  const [windowWidth, setWindowWidth] = useState(getWidth());
  const [listGroupMinHeight, setListGroupMinHeight] = useState(getWidth());

  function handleActivePageChange(page) {
    listFiles({ setLoading, parentId: currentDirectoryID, page })
      .then(response => {
        if (response) {
          dispatch(setCurrentDirectoryImages(response.data.data));
          dispatch(setPagination(response.data.meta));
        }
      });
  }

  useEffect(() => {
    if (windowWidth < 540) setListGroupMinHeight("100px");
    else if (windowWidth > 541) setListGroupMinHeight("350px");
  }, [windowWidth]); //eslint-disable-line

  useEffect(() => {
    const widthListener = () => setWindowWidth(getWidth());
    window.addEventListener("resize", widthListener);
    return () => window.removeEventListener("resize", widthListener);
  }, []);

  return (
    <>
      <CListGroup id="image-list-group" className="mb-2" style={{ minHeight: listGroupMinHeight, overflowY: "auto" }}>
        <CListGroupItem>
          <SearchFileInput/>
        </CListGroupItem>
        {directories.map(folder => <Folder key={folder.id} id={folder.id} name={folder.name}/>)}
      </CListGroup>
      {currentDirectoryImages.length ? (
        <>
          <CPagination
            size="sm"
            align="start"
            pages={pagination.pages - 1 || 0}
            activePage={pagination.page}
            onActivePageChange={handleActivePageChange}
          />
          <h6 className="text-info">Exibindo {currentDirectoryImages.length} de {pagination.total} arquivos</h6>
        </>
      ) : <></>}
    </>
  );
}

export default Folders;
