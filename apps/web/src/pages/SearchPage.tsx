import { useState } from 'react';
import { Box, Loader, Text, TextInput, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { SEARCH_QUERY_MAX } from '@migenda/shared';

import { fetchSearch } from '../api/search';
import { AppNav } from '../components/AppNav';
import { SearchEventDetails } from '../components/search/SearchEventDetails';
import { SearchResultList } from '../components/search/SearchResultList';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useSearchQuery } from '../hooks/useSearchQuery';
import { searchInputClassName } from '../classNames/shared';
import type { SearchDetailsTarget } from '../schedule/searchDetails';

export function SearchPage() {
  const { data: user, isLoading } = useRequireAuth();
  const { draft, setDraft, query } = useSearchQuery();
  const [details, setDetails] = useState<SearchDetailsTarget | null>(null);
  const search = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    enabled: Boolean(user) && query.length > 0,
  });
  const results = search.data?.results ?? [];

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={760} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        <Title order={1} fz={28} fw={800} lh={1.1} mb={20}>
          Search
        </Title>
        {isLoading || !user ? (
          <Loader color="accent" />
        ) : (
          <TextInput
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            placeholder="Search events, notes, people…"
            aria-label="Search"
            maxLength={SEARCH_QUERY_MAX}
            mb={24}
            classNames={{ input: searchInputClassName }}
          />
        )}
        {query && search.isLoading ? <Loader color="accent" /> : null}
        {search.isError ? <Text>Could not search.</Text> : null}
        {query && search.isSuccess ? (
          <>
            <p className="mb-4 mt-0 text-[12px] uppercase tracking-[0.06em] opacity-[0.55]">
              {results.length === 1 ? '1 result' : `${results.length} results`} for &quot;{query}&quot;
            </p>
            <SearchResultList results={results} query={query} onView={setDetails} />
          </>
        ) : null}
      </Box>
      <SearchEventDetails target={details} onClose={() => setDetails(null)} />
    </Box>
  );
}
