import React, { useEffect } from "react";
import { userManager } from "../../hooks/user";

interface Props {}
export const PageLogout: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    const main = async () => {
      localStorage.removeItem("CURRENT_USER");
      await userManager.removeUser();
    };
    main();
  });
  return <h1>Logout page</h1>;
};
