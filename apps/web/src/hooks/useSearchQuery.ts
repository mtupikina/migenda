import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const URL_SYNC_DELAY_MS = 300;

export function useSearchQuery() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  const [draft, setDraft] = useState(urlQuery);
  const lastWritten = useRef(urlQuery);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (urlQuery === lastWritten.current) {
      return;
    }
    lastWritten.current = urlQuery;
    window.clearTimeout(timer.current);
    setDraft(urlQuery);
  }, [urlQuery]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const changeDraft = useCallback(
    (value: string) => {
      setDraft(value);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const next = new URLSearchParams();
        lastWritten.current = value.trim() ? value : '';
        if (lastWritten.current) {
          next.set('q', lastWritten.current);
        }
        setParams(next, { replace: true });
      }, URL_SYNC_DELAY_MS);
    },
    [setParams],
  );

  return { draft, setDraft: changeDraft, query: urlQuery.trim() };
}
