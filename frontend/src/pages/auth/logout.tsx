import React, { useEffect } from "react";
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
  return <h1>Logout page</h1>;
};
