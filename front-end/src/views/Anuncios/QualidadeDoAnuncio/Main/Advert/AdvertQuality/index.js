import React, { useMemo, useState } from "react";
import CustomPopover from "./Popover";
import QualityCircle from "./QualityCircle";
import { Provider } from "./context";

export default function AdvertQuality({ id, quality }) {
  const color = useMemo(() => {
    if (quality < 60) return "red";
    else if (quality < 80) return "yellow";
    else if (quality < 100) return "greenyellow";
    else if (quality >= 100) return "green";
    else return "";
  }, [quality]);

  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const setPopoverOpen = () => setIsPopoverOpen(true);
  const setPopoverClosed = () => setIsPopoverOpen(false);
  const [qualityDetails, setQualityDetails] = useState({});
  function handleOnMouseLeave() {
    if (isPopoverOpen) {
      const circle = document.querySelector(`#quality-circle-btn-${id}`);
      if (circle) circle.click();
      setPopoverClosed();
    }
  }
  return (
    <Provider
      value={{
        id,
        color,
        quality,
        setLoading,
        loading,
        isPopoverOpen,
        setPopoverOpen,
        setPopoverClosed,
        qualityDetails,
        setQualityDetails,
      }}
    >
      <td
        className="text-center"
        title={quality}
        onMouseLeave={handleOnMouseLeave}
      >
        <QualityCircle />
        <CustomPopover />
      </td>
    </Provider>
  );
}
