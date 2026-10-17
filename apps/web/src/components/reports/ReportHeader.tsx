import { Button, Title } from '@mantine/core';

type ReportHeaderProps = {
  typeName: string;
  subtitle: string;
};

export function ReportHeader({ typeName, subtitle }: ReportHeaderProps) {
  return (
    <header className="mb-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <Title order={1} fz={28} fw={800} lh={1.1}>
          Summary — {typeName}
        </Title>
        <Button variant="default" disabled className="whitespace-nowrap">
          Export
        </Button>
      </div>
      <p className="m-0 text-[14px] opacity-65">{subtitle}</p>
    </header>
  );
}
