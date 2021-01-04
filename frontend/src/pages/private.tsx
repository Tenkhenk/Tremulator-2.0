import React from "react";
import { useUser } from "../hooks/user";
import { useGet } from "../hooks/api";

interface Props {}
export const PagePrivate: React.FC<Props> = (props: Props) => {
  const { user } = useUser();
  const { data, loading, error } = useGet<any>("/auth/whoami");
  return (
    <>
      <h1>
        Private page : {user?.firstname} {user?.lastname}
      </h1>
      <div>
        <h2>GET hook</h2>
        {loading && <p>Api is loading ...</p>}
        {error && <p>Api error: {error.message}</p>}
        {data && <p>Api data: {JSON.stringify(data)}</p>}
      </div>
    </>
  );
};
