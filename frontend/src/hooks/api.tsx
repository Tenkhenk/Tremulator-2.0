import { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../config";
import { manager } from "./user";

interface APIResult<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

/**
 * API hook for GET
 */
export function useGet<R>(path: string, urlParams?: { [key: string]: unknown }): APIResult<R> {
  const [data, setData] = useState<R | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const main = async () => {
      const user = await manager.getUser();
      setData(null);
      setLoading(true);
      setError(null);
      try {
        const response = await axios({
          method: "GET",
          params: urlParams,
          url: `${config.api_path}${path}`,
          responseType: "json",
          headers: user ? { Authorization: `${user.token_type} ${user.access_token}` } : {},
        });
        setData(response.data as R);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    main();
  }, [path, urlParams]);

  return { loading, error, data };
}

/**
 * API hook for POST
 */
export function usePost<P, R>(
  path: string,
): [(data: P, urlParams?: { [key: string]: unknown }) => Promise<APIResult<R>>, APIResult<R>] {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<R | null>(null);

  async function post(body: P, urlParams: { [key: string]: unknown } = {}): Promise<APIResult<R>> {
    setData(null);
    setLoading(true);
    setError(null);
    try {
      const user = await manager.getUser();
      const response = await axios({
        method: "POST",
        url: `${config.api_path}${path}`,
        responseType: "json",
        params: urlParams,
        headers: user ? { Authorization: `${user.token_type} ${user.access_token}` } : {},
        data: body,
      });
      setData(response.data as R);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
    return { loading, error, data };
  }

  return [post, { loading, error, data }];
}
