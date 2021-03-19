import { useHistory } from "react-router-dom";

type SetterInputFunction<Z> = (prev: Z) => Z;

/**
 * Hook to manage a variable in the url.
 *
 * @param key {string} Name of the variable
 * @param defaultValue {string} The default / initial value of the attribute (not set in the url)
 * @param replace {boolean} When the url change; do we replace or put in the history
 */
export function useQueryParam<T>(
  key: string,
  defaultValue: T,
  replace = false,
): [T, (value: T | SetterInputFunction<T>) => void] {
  const history = useHistory();

  /**
   * Retrieve the value of the given parameter.
   */
  function getQueryParam(key: string): T {
    const urlQueryParams = new URLSearchParams(window.location.search);
    const value = urlQueryParams.get(key);
    if (value === null) {
      return defaultValue;
    }
    if (isNaN((value as unknown) as number) === false) {
      return (parseFloat(value) % 1 === 0 ? parseInt(value) : (parseFloat(value) as unknown)) as T;
    }
    if (value === "false" || value === "true") {
      return ((value === "true") as unknown) as T;
    }
    return (value as unknown) as T;
  }

  /**
   * Given a parameter, it returns the setter for it.
   */
  function getSetQueryParam(key: string): (value: T | SetterInputFunction<T>) => void {
    return (value: T | SetterInputFunction<T>): void => {
      const urlQueryParams = new URLSearchParams(window.location.search);
      const prevValue = getQueryParam(key);
      const computedValue = typeof value === "function" ? (value as SetterInputFunction<T>)(prevValue) : value;
      if (computedValue !== prevValue) {
        if (computedValue !== defaultValue) {
          urlQueryParams.set(key, computedValue + "");
        } else {
          urlQueryParams.delete(key);
        }
        if (replace) {
          history.replace({ search: `?${urlQueryParams.toString()}` });
        } else {
          history.push({ search: `?${urlQueryParams.toString()}` });
        }
      }
    };
  }

  return [getQueryParam(key), getSetQueryParam(key)];
}
