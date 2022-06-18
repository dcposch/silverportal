import "./Modal.css";

import * as React from "react";

export default function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  React.useEffect(() => {
    console.log("escape");
    const onP = (k: KeyboardEvent) => k.code === "Escape" && onClose();
    document.addEventListener("keydown", onP);
    return () => document.removeEventListener("keydown", onP);
  }, []);

  return (
    <div className="modal-wrap">
      <div className="modal-window">
        <h2 className="modal-header">
          <span>{title}</span>
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
        </h2>
        {children}
      </div>
    </div>
  );
}
