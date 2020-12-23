import React from "react";
import { useUser } from "../hooks/user";
import { useGet, usePost } from "../hooks/api";

interface Props {}
export const PageHome: React.FC<Props> = (props: Props) => {
  const [user] = useUser();
  const { data, loading, error } = useGet<string>("/misc/ping");
  const [echo, { loading: postLoading, error: postError, data: postData }] = usePost<
    { test: string },
    { test: string }
  >("/misc/echo");
  return (
    <>
      <h1>Hello World {user?.name}</h1>
      <div>
        <h2>GET hook</h2>
        {loading && <p>Api is loading ...</p>}
        {error && <p>Api error: {error.message}</p>}
        {data && <p>Api data: {data}</p>}
      </div>
      <div>
        <h2>POST hook</h2>
        <span
          onClick={async () => {
            const response = await echo({ test: "Hello World" });
            console.log(response);
          }}
        >
          CLICK ME
        </span>
        {postLoading && <p>Api is loading ...</p>}
        {postError && <p>Api error: {postError.message}</p>}
        {postData && <p>Api data: {JSON.stringify(postData)}</p>}
      </div>
    </>
  );
};
