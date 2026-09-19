import { Box, Container } from '@mantine/core';

import { LandingBoardSection } from '../components/landing/LandingBoardSection';
import { LandingCta } from '../components/landing/LandingCta';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingStats } from '../components/landing/LandingStats';
import { MarketingNav } from '../components/MarketingNav';
import { Rule } from '../components/Rule';

export function LandingPage() {
  return (
    <Box mih="100vh">
      <MarketingNav />
      <Container size={1200} px={{ base: 20, sm: 72 }}>
        <LandingHero />
        <Rule />
        <LandingStats />
        <LandingFeatures />
        <LandingBoardSection />
      </Container>
      <LandingCta />
      <LandingFooter />
    </Box>
  );
}
