import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  title?: string;
}
const Header: React.FC<React.PropsWithChildren<Props>> = (props: React.PropsWithChildren<Props>) => {
  const { title, children } = props;

  useEffect(() => {
    if (title) document.title = title;
    else document.title = "Tremulator";
  });

  return <>{children}</>;
};

export const PageHeader: React.FC<React.PropsWithChildren<Props>> = (props: React.PropsWithChildren<Props>) => {
  const appHeader = document.getElementById("app-header");
  if (!appHeader) return null;
  return <>{createPortal(<Header {...props} />, appHeader)}</>;
};
