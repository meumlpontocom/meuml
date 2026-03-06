import React, { useEffect, useState }                        from "react";
import PageHeader                                            from "../../components/PageHeader";
import { CRow, CCol }                                        from "@coreui/react";
import LoadPageHandler                                       from "src/components/Loading";
import ImagesStoreHeader                                     from "./ImagesStoreHeader";
import { listDirectories, }                                  from "./requests";
import ImagesStoreImagesDisplay                              from "./ImagesStoreImagesDisplay";
import ImagesStoreFoldersDisplay                             from "./ImageStoreFoldersDisplay";
import { useDispatch, useSelector }                          from "react-redux";
import { setAvailableDirectories, setIsImageStorageLoading } from "src/redux/actions";
import CallToAction                                          from "src/views/CallToAction";

const ImagesStore = () => {
  const dispatch = useDispatch();
  const [error402, setError402] = useState(() => false);
  const setLoading = bool => dispatch(setIsImageStorageLoading(bool));
  const loading = useSelector(({ imageStorage }) => imageStorage.isLoading);

  useEffect(() => {
    listDirectories({ setLoading }).then(response => {
      if (response.statusCode === 402) {
        setError402(true);
      } else dispatch(setAvailableDirectories(response.data.data));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return error402 ? (
    <CallToAction />
  ) : (
    <LoadPageHandler
      isLoading={loading}
      render={
        <>
          <PageHeader heading="Hospedagem de imagens"/>
          <ImagesStoreHeader/>
          <CRow>
            <CCol className="d-flex flex-row">
              <ImagesStoreFoldersDisplay/>
              <ImagesStoreImagesDisplay/>
            </CCol>
          </CRow>
        </>
      }
    />
  );
};

export default ImagesStore;
