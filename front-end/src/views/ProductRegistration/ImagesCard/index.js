import React, { useCallback, useEffect } from "react";
import LoadingCardData                   from "../../../components/LoadingCardData";
import ImageStorageTip                   from "./ImageStorageTip";
import CardHeader                        from "./CardHeader";
import Folders                           from "./Folders";
import Images                            from "./Images";
import { useDispatch, useSelector }      from "react-redux";
import { listDirectories, listFiles }    from "../../ImagesStore/requests";
import { CCard, CCardBody, CRow, CCol }  from "@coreui/react";
import {
  setPagination,
  setDirectories,
  setIsImagesLoading,
  setCleanupViewState,
  setCurrentDirectoryImages,
}                                        from "../../../redux/actions/_newProductActions";
import SelectionData                     from "./SelectionData";

const ImagesCard = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.newProduct.images.isLoading);
  const currentDirectoryID = useSelector(state => state.newProduct.images.currentDirectoryID);
  const setLoading = useCallback(boolean => dispatch(setIsImagesLoading(boolean)), [dispatch]);
  const setFolders = useCallback(list => dispatch(setDirectories(list)), [dispatch]);

  useEffect(() => {
    listDirectories({ setLoading })
      .then(response => {
        if (response.data) setFolders(response.data?.data);
      });
    return () => dispatch(setCleanupViewState());
  }, [dispatch, setFolders, setLoading]);

  useEffect(() => {
    if (currentDirectoryID && currentDirectoryID !== "searchFiles") {
      listFiles({ setLoading, parentId: currentDirectoryID, page: 1 })
        .then(response => {
          if (response.data) {
            dispatch(setCurrentDirectoryImages(response.data?.data));
            dispatch(setPagination(response.data?.meta));
          }
        });
    }
  }, [currentDirectoryID, dispatch, setLoading]);

  const Loading = ({ children }) => {
    return isLoading
      ? <LoadingCardData/>
      : children;
  }

  return (
    <CCard>
      <CardHeader/>
      <CCardBody>
        <CRow style={{ margin: "0px" }}>
          <CCol xs={12} sm={9}>
            <ImageStorageTip/>
          </CCol>
          <CCol xs={12} sm={3} style={{ paddingBottom: "12px" }}>
            <SelectionData/>
          </CCol>
        </CRow>
        <Loading>
          <CRow style={{ margin: "0px" }}>
            <CCol xs={12} md={4}>
              <Folders/>
            </CCol>
            <CCol xs={12} md={8} className="mt-3 mt-sm-0 d-flex align-items-center justify-content-center">
              <Images/>
            </CCol>
          </CRow>
        </Loading>
      </CCardBody>
    </CCard>
  );
};

export default ImagesCard;
