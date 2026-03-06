import React, { useState, createContext } from "react";

export const FlexConfigContext = createContext();

export const FlexConfigContextProvider = (props) => {
  const [currentFlexConfig, setCurrentFlexConfig] = useState({});
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isSaturdayEnabled, setIsSaturdayEnabled] = useState(false);
  const [isSundayEnabled, setIsSundayEnabled] = useState(false);
  const [cutoffWeekday, setCutOffWeekday] = useState("");
  const [cutoffSaturday, setCutOffSaturday] = useState("");
  const [cutoffSunday, setCutOffSunday] = useState("");

  return (
    <FlexConfigContext.Provider
      value={{
        currentFlexConfig,
        setCurrentFlexConfig,
        deliveryWindow,
        setDeliveryWindow,
        capacity,
        setCapacity,
        isSaturdayEnabled,
        setIsSaturdayEnabled,
        isSundayEnabled,
        setIsSundayEnabled,
        cutoffWeekday,
        setCutOffWeekday,
        cutoffSaturday,
        setCutOffSaturday,
        cutoffSunday,
        setCutOffSunday,
      }}
    >
      {props.children}
    </FlexConfigContext.Provider>
  );
};
