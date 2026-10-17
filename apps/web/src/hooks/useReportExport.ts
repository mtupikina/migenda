import { useEffect, useState } from 'react';

import { printWithTitle } from '../schedule/printWithTitle';

type ExportState = 'idle' | 'loading' | 'printing';

/**
 * Export = keep loading the next page until every row is shown, then open the print dialog
 * (the user saves it as a PDF). `hasMore` comes from the rendered data so print never runs early.
 * `loadMore` loads one page and resolves to whether another page remains; it must reject on failure.
 */
export function useReportExport(loadMore: () => Promise<boolean>, hasMore: boolean, documentTitle: string) {
  const [state, setState] = useState<ExportState>('idle');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (state !== 'printing' || hasMore) {
      return;
    }
    printWithTitle(documentTitle);
    setState('idle');
  }, [state, hasMore, documentTitle]);

  async function start() {
    setFailed(false);
    setState('loading');
    try {
      let more = hasMore;
      while (more) {
        more = await loadMore();
      }
      setState('printing');
    } catch {
      setFailed(true);
      setState('idle');
    }
  }

  return { start, exporting: state !== 'idle', failed };
}
