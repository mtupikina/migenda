import { Box, Grid, Text, Title } from '@mantine/core';

import { rule } from '../../theme';

type FeatureRowProps = {
  index: string;
  title: string;
  copy: string;
  showTopBorder?: boolean;
};

export function FeatureRow({ index, title, copy, showTopBorder }: FeatureRowProps) {
  return (
    <Grid
      gutter={{ base: 28, md: 72 }}
      align="baseline"
      py={42}
      style={showTopBorder ? { borderTop: rule } : undefined}
    >
      <Grid.Col span={{ base: 12, sm: 3 }}>
        <Text pos="relative" fw={800} fz={15} pl={24}>
          <Box pos="absolute" left={0} top={4} w={10} h={10} bg="accent.5" />
          {index}
        </Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 9 }}>
        <Title order={2} fz={24} lh="28px" lts="-0.01em">
          {title}
        </Title>
        <Text fz={15.5} lh="28px" mt={12} opacity={0.78} maw="60ch">
          {copy}
        </Text>
      </Grid.Col>
    </Grid>
  );
}
