import type { ReactNode } from 'react';

import { searchMatchParts } from '@migenda/shared';

export function highlightMatches(text: string, query: string): ReactNode {
  return searchMatchParts(text, query).map((part, index) => {
    if (part.match) {
      return <b key={index}>{part.text}</b>;
    }
    return part.text;
  });
}
