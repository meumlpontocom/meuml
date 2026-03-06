import React                                                 from "react";
import { AiTwotoneShop }                                     from "react-icons/ai";
import { HiLightningBolt }                                   from "react-icons/hi";
import { FaTags, FaPercentage }                              from "react-icons/fa";
import { RiNumbersFill, RiThumbUpFill, RiCalendarCheckLine } from "react-icons/ri";

const dictionary = {
  "DEAL": {
    background: "rgb(255, 255, 255)",
    foreground: "rgba(0, 0, 0, 0.8)",
    icon: <FaTags />
  },
  "MARKETPLACE_CAMPAIGN": {
    background: "rgba(253, 221, 50, 0.8)",
    foreground: "rgba(0, 0, 0, 0.8)",
    icon: <AiTwotoneShop />
  },
  "VOLUME": {
    background: "rgba(106, 194, 221, 0.8)",
    foreground: "rgba(0, 0, 0, 0.8)",
    icon: <RiNumbersFill />
  },
  "DOD": {
    background: "rgb(50, 31, 219)",
    foreground: "rgb(255, 255, 255)",
    icon: <RiCalendarCheckLine />
  },
  "LIGHTNING": {
    background: "rgb(103, 31, 219)",
    foreground: "rgb(255, 255, 255)",
    icon: <HiLightningBolt />
  },
  "PRICE_DISCOUNT": {
    background: "rgb(46, 184, 92)",
    foreground: "rgb(255, 255, 255)",
    icon: <FaPercentage />
  },
  "PRE_NEGOTIATED": {
    background: "rgb(184, 46, 92)",
    foreground: "rgb(255, 255, 255)",
    icon: <RiThumbUpFill />
  },
};

export default dictionary;
