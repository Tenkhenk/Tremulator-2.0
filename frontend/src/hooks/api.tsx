import { useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { config } from "../config";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";

interface APIResult<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

/**
 * API hook for GET
 */
export function useGet<R>(
  path: string,
  urlParams?: { [key: string]: unknown },
): APIResult<R> & { fetch: (params?: { [key: string]: unknown }) => void } {
  const [data, setData] = useState<R | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const { oidcUser } = useContext(AuthenticationContext);
  const [params, setParams] = useState<{ [key: string]: unknown }>(urlParams || {});

  // just a var that we increment for refetch
  const [refetchVar, setRefetchVar] = useState<number>(0);

  function fetch(params?: { [key: string]: unknown }) {
    if (params) setParams(params);
    else {
      // force useEffect
      setRefetchVar((e) => {
        return e + 1;
      });
    }
  }

  useEffect(() => {
    const main = async () => {
      setData(null);
      setLoading(true);
      setError(null);
      try {
        const response = await axios({
          method: "GET",
          params,
          url: `${config.api_path}${path}`,
          responseType: "json",
          headers: oidcUser ? { Authorization: `${oidcUser.token_type} ${oidcUser.access_token}` } : {},
        });
        setData(response.data as R);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    main();
  }, [path, params, oidcUser, refetchVar]);

  return { loading, error, data, fetch };
}

/**
 * API hook for POST
 */
export function usePost<P, R>(
  path: string,
): [(data: P, urlParams?: { [key: string]: unknown }) => Promise<R>, APIResult<R>] {
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<R | null>(null);
  const { oidcUser } = useContext(AuthenticationContext);

  async function post(body: P, urlParams: { [key: string]: unknown } = {}): Promise<R> {
    setData(null);
    setLoading(true);
    setError(null);
    let data: R | null = null;
    try {
      const response = await axios({
        method: "POST",
        url: `${config.api_path}${path}`,
        responseType: "json",
        params: urlParams,
        headers: oidcUser ? { Authorization: `${oidcUser.token_type} ${oidcUser.access_token}` } : {},
        data: body,
      });
      data = response.data as R;
      setData(data);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
    return data as R;
  }

  return [post, { loading, error, data }];
}

/**
 * API hook for PUT
 */
export function usePut<P>(
  path: string,
): [(data: P, urlParams?: { [key: string]: unknown }) => Promise<void>, APIResult<P>] {
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<P | null>(null);
  const { oidcUser } = useContext(AuthenticationContext);

  async function put(body: P, urlParams: { [key: string]: unknown } = {}): Promise<void> {
    setData(null);
    setError(null);
    setLoading(true);
    try {
      await axios({
        method: "PUT",
        url: `${config.api_path}${path}`,
        responseType: "json",
        params: urlParams,
        headers: oidcUser ? { Authorization: `${oidcUser.token_type} ${oidcUser.access_token}` } : {},
        data: body,
      });
      setData(body);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
    return;
  }

  return [put, { loading, error, data }];
}

/**
 * API hook for DELETE
 */
export function useDelete<R>(
  path: string,
): [(body?: R, urlParams?: { [key: string]: unknown }) => Promise<void>, APIResult<R>] {
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<R | null>(null);
  const { oidcUser } = useContext(AuthenticationContext);

  async function del(body: R | undefined, urlParams: { [key: string]: unknown } = {}): Promise<void> {
    setData(null);
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        method: "DELETE",
        url: `${config.api_path}${path}`,
        responseType: "json",
        params: urlParams,
        headers: oidcUser ? { Authorization: `${oidcUser.token_type} ${oidcUser.access_token}` } : {},
        data: body,
      });
      setData(response.data as R);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
    return;
  }

  return [del, { loading, error, data }];
}
