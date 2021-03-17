import React from "react";

interface Props {}
export const PageHeader: React.FC = (props: React.PropsWithChildren<Props>) => {
  const { children } = props;
  return <header id="page-header">{children}</header>;
};
