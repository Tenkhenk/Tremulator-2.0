import { useState } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

interface ExportReturnType {
  loading: boolean;
  progress: number; //number of process item
  error: Error | null;
}

type DataFn = (page: number) => Promise<Array<any>>;
type ExportHookType = [(fn: DataFn, filename: string) => Promise<void>, ExportReturnType];

export function useExportToCsv(): ExportHookType {
  // State of the hook
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Function to do the export
  async function exportFn(fn: DataFn, filename: string): Promise<void> {
    setLoading(true);
    setError(null);
    setProgress(0);

    let data: any = [];
    let page = 1;
    let shouldContinue = true;
    try {
      // Load the data in batch mode
      while (shouldContinue) {
        const batchResult: any = await fn(page);
        if (batchResult.length > 0) {
          data = data.concat(batchResult);
          setProgress(data.length);
        } else {
          shouldContinue = false;
        }
        page++;
      }
      if (data.length === 0) {
        throw new Error("No data to export");
      } else {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv" });
        saveAs(blob, filename);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return [exportFn, { loading, error, progress }];
}
