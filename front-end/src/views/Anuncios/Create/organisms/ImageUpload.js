import React, { useContext, useCallback, useMemo, useEffect } from "react";
import { CCardBody }                                          from "@coreui/react";
import { Card, CardHeader }                                   from "../atoms";
import { UploadedFiles, FileUploadInput }                     from "../molecules";
import { createMlAdvertContext }                              from "../createMlAdvertContext";

export default function ImageUpload() {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const images = useMemo(() => form.images, [form.images]);
  const shouldRenderComponent = useMemo(() => !!form.availableQuantity, [form.availableQuantity]);

  const setResetImageUpload = useCallback(() => setFormData({ id: "images", value: [] }), [setFormData]);
  useEffect(() => {
    return setResetImageUpload();
  }, [setResetImageUpload]);

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary">
      <CardHeader
        title="Imagens do anúncio"
        subtitle="Tamanho máximo 5mb, resolução mínima 500x500, formatos aceitos .jpg, .png, .jpeg"
      />
      <CCardBody>
        <UploadedFiles images={images} />
        <FileUploadInput images={images} setFormData={setFormData} />
      </CCardBody>
    </Card>
  );
}
