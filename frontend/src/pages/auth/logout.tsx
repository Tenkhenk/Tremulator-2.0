import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { manager } from "../../hooks/user";

interface Props {}
export const PageLogout: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    const main = async () => {
      localStorage.removeItem("CURRENT_USER");
      await manager.removeUser();
    };
    main();
  });
  return <Redirect to={"/"}></Redirect>;
};
