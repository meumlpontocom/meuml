import { useEffect, useState } from "react";

const useIsXsDisplay = () => {
  const [isXsDisplay, setIsXsDisplay] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      setIsXsDisplay(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);
  return isXsDisplay;
}

export default useIsXsDisplay;
