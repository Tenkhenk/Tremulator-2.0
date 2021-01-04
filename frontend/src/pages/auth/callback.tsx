import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { manager } from "../../hooks/user";

interface Props {}
export const PageAuthCallback: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const main = async () => {
      try {
        setLoading(true);
        await manager.signinRedirectCallback();
        const redirectUrl: string = localStorage.getItem("AUTH_REDIRECT_URL") || "/";
        history.push(redirectUrl || "/");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    main();
  }, [history]);

  return (
    <>
      <h1>Auth callback</h1>
      {error && <p>{error}</p>}
      {loading && <p>Loading ...</p>}
    </>
  );
};
