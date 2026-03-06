import React, { useEffect, useContext } from "react";
import PopoverTitle from "./PopoverTitle";
import PopoverContent from "./PopoverContent";
import UncontrolledPopover from "reactstrap/lib/UncontrolledPopover";
import PopoverHeader from "reactstrap/lib/PopoverHeader";
import PopoverBody from "reactstrap/lib/PopoverBody";
import fetchQualityDetails from "../fetchQualityDetails";
import context from "../context";

export default function CustomPopover() {
  const {
    id,
    loading,
    setLoading,
    isPopoverOpen,
    qualityDetails,
    setQualityDetails,
  } = useContext(context);

  useEffect(() => {
    if (
      !loading &&
      isPopoverOpen &&
      (qualityDetails === null || !Object.keys(qualityDetails).length)
    ) {
      setLoading(true);
      fetchQualityDetails({ id, setQualityDetails });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isPopoverOpen, qualityDetails]);

  useEffect(() => {
    if (
      (qualityDetails?.actions?.length || qualityDetails?.goals?.length) &&
      loading
    )
      setLoading(false);
    return () => loading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualityDetails]);

  return document.querySelector(`#quality-circle-btn-${id}`) ? (
    <UncontrolledPopover
      target={`quality-circle-btn-${id}`}
      isOpen={isPopoverOpen}
      container="body"
    >
      <PopoverHeader>
        <PopoverTitle id={id} />
      </PopoverHeader>
      <PopoverBody>
        <PopoverContent />
      </PopoverBody>
    </UncontrolledPopover>
  ) : (
    <></>
  );
}
