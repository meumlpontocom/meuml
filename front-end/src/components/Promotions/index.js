import React, { useState } from "react"
import Badges              from "./Badges"
import PopUp               from "./Popup"

export default function Promotions({ promotions }) {
  const [selectedPromotion, setSelectedPromotion] = useState({});
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  return (
    <>
      <PopUp 
        isPopUpOpen={isPopUpOpen} 
        togglePopUpOpen={setIsPopUpOpen} 
        selectedPromotion={selectedPromotion}
      />
      <Badges 
        togglePopUpOpen={setIsPopUpOpen} 
        promotions={promotions} 
        setSelectedPromotion={setSelectedPromotion} 
      />
    </>
  );
}
