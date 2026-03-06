import React, { useContext } from "react";
import LoadingCardData from "../../../../../../../../components/LoadingCardData";
import context from "../../context";
import ProfessionalAdvertText from "./ProfessionalAdvertText";

export default function PopoverContent() {
  const { loading, qualityDetails } = useContext(context);

  return loading ? (
    <LoadingCardData />
  ) : qualityDetails?.actions?.length ? (
    <>
      <p className="text-info">{qualityDetails?.level}</p>
      <ul>
        {qualityDetails?.actions.map(({ id, name, description }, index) => {
          return (
            <li id={id} name={name} key={index}>
              {description}
            </li>
          );
        })}
      </ul>
    </>
  ) : (
    <ProfessionalAdvertText />
  );
}
