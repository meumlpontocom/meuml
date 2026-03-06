import React from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function AnswerStatusMsg() {
  const questions = useSelector((state) => state.questions);
  const status = questions.meta?.status;
  const type = questions.meta?.type;
  if (!toast.isActive(9128379127)) {
    return status !== undefined ? (
      <div
        onLoad={toast(<p>{status}</p>, {
          type: type === "success" ? toast.TYPE.SUCCESS : toast.TYPE.ERROR,
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          toastId: 9128379127,
        })}
      />
    ) : null;
  }
  return <></>;
}
