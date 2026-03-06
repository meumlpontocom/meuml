/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { deleteFilesTags } from "../../../views/ImagesStore/requests";
import { CBadge, CCardBody, CTooltip } from "@coreui/react";
import refreshImageList from "../../../views/ImagesStore/refreshImageList";

const ImageCardBody = ({ id, copyImageLink, setLoading }) => {
  const dispatch = useDispatch();
  const { images } = useSelector(({ imageStorage }) => imageStorage.files);
  const image = useMemo(() => {
    return images.filter(image => image.id === id)[0] ?? {};
  }, [images]);

  async function removeTagFromImage(tag) {
    const payload = {
      data: {
        type: "untag_files",
        attributes: {
          tags: [tag],
          files_id: [id],
        },
      },
    };
    const tagRemovalResponse = await deleteFilesTags({ setLoading, payload });
    if (tagRemovalResponse) {
      toast(tagRemovalResponse.data.message, { type: toast.TYPE.SUCCESS });
      refreshImageList(dispatch, setLoading);
    }
  }

  const EmptyTagListPlaceholder = () => <p className="text-muted small">Nenhuma TAG atribuida</p>;

  return (
    <CCardBody className="p-1">
      <div className="w-100 d-flex">
        <div className={styles.tagIcon}>
          <i className="cil-tags" />
        </div>
        <div className={styles.tagInput}>
          {image.meuml_tags ? (
            image.meuml_tags[0] ? (
              image.meuml_tags.map(tag => (
                <CBadge key={tag} color="warning" className="mr-2">
                  {tag.name}&nbsp;
                  <i className="cil-x pointer" onClick={() => removeTagFromImage(tag.id)} />
                </CBadge>
              ))
            ) : (
              <EmptyTagListPlaceholder />
            )
          ) : (
            <EmptyTagListPlaceholder />
          )}
        </div>
      </div>
      <div className="w-100 d-flex mt-2">
        <div className={styles.tagIcon}>
          <i className="cil-link" />
        </div>
        <CTooltip content="Clique para copiar">
          <div className={styles.tagInput} onClick={() => copyImageLink(image?.url)}>
            {image?.url}
          </div>
        </CTooltip>
      </div>
    </CCardBody>
  );
};

export default ImageCardBody;
