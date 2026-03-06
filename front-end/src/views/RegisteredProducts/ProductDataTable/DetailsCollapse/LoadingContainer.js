import React           from "react";
import LoadingCardData from "src/components/LoadingCardData";

export default function LoadingContainer({ children, isLoading }) {
  return isLoading ? <LoadingCardData /> : children;
}
