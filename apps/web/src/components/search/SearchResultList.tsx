import type { SearchHit } from '@migenda/shared';

import { formatNoteTime } from '../calendar/noteTime';
import type { SearchDetailsTarget } from '../../schedule/searchDetails';
import { searchDetailsFromEvent, searchDetailsFromNote } from '../../schedule/searchDetails';
import { highlightMatches } from './highlightMatches';
import { SearchResultCard } from './SearchResultCard';

type SearchResultListProps = {
  results: SearchHit[];
  query: string;
  onView: (target: SearchDetailsTarget) => void;
};

export function SearchResultList({ results, query, onView }: SearchResultListProps) {
  return (
    <div className="grid gap-4">
      {results.map((hit) => {
        if (hit.kind === 'note') {
          return (
            <SearchResultCard
              key={hit.id}
              kind="note"
              time={`${formatNoteTime(hit.createdAt)} — ${hit.authorName}`}
              action="View note details →"
              onView={() => onView(searchDetailsFromNote(hit))}
            >
              <p className="m-0 text-[13px] opacity-[0.85]">{highlightMatches(hit.excerpt, query)}</p>
            </SearchResultCard>
          );
        }
        return (
          <SearchResultCard
            key={`${hit.eventId}-${hit.occurrenceStart}`}
            kind="event"
            time={formatNoteTime(hit.start)}
            action="View event details →"
            onView={() => onView(searchDetailsFromEvent(hit))}
          >
            <p className="m-0 text-[15px]">{highlightMatches(hit.title, query)}</p>
            {hit.excerpt ? (
              <p className="mb-0 mt-1.5 text-[13px] opacity-70">{highlightMatches(hit.excerpt, query)}</p>
            ) : null}
          </SearchResultCard>
        );
      })}
    </div>
  );
}
