import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Box, Button, Text, Title } from '@mantine/core';

import { Kicker } from '../components/Kicker';
import { Nav } from '../components/Nav';
import { Rule } from '../components/Rule';
import { privacyDocument } from '../legal/privacyDocument';
import { termsDocument } from '../legal/termsDocument';

const documents = {
  terms: termsDocument,
  privacy: privacyDocument,
} as const;

export function LegalPage({ kind }: { kind: keyof typeof documents }) {
  const document = documents[kind] || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [document.title]);

  return (
    <Box mih="100vh">
      <Nav aria-label={document.title}>
        <Button component={Link} to="/create-account" variant="default">
          Create account
        </Button>
      </Nav>
      <Box maw={760} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        <Kicker>Legal</Kicker>
        <Title order={1} fz={28} mb={8}>
          {document.title}
        </Title>
        <Text fz={14} opacity={0.65} mb={12}>
          Last updated {document.updated}
        </Text>
        {document.sections.map((section) => (
          <Box key={section.heading} component="section" py={28}>
            <Rule />
            <Title order={2} fz={18} mt={28} mb={12}>
              {section.heading}
            </Title>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} fz={15} lh="26px" opacity={0.78} mb={12} maw="60ch">
                {paragraph}
              </Text>
            ))}
          </Box>
        ))}
        <Text fz={14} mt={16}>
          Also see the{' '}
          <Anchor component={Link} to={document.otherHref} c="accent.7" className="hover:text-accent">
            {document.otherLabel}
          </Anchor>.
        </Text>
      </Box>
    </Box>
  );
}
