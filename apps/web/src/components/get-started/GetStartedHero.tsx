import { Image, Text } from '@mantine/core';

import { Kicker } from '../Kicker';

type GetStartedHeroProps = {
  kicker: string;
  lead: string;
};

export function GetStartedHero({ kicker, lead }: GetStartedHeroProps) {
  return (
    <div className="mb-[70px] text-center">
      <Kicker>{kicker}</Kicker>
      <h1 className="mb-4 mt-0 flex flex-wrap items-center justify-center gap-[0.25em] text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.1]">
        Win the day before it starts
        <Image src="/brand-icon.png" alt="" h="1em" w="auto" display="inline-block" />
      </h1>
      <Text fz={16} maw="56ch" mx="auto" className="opacity-[0.72]">
        {lead}
      </Text>
    </div>
  );
}
