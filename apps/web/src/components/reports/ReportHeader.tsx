import { Button, Title } from '@mantine/core';

type ReportHeaderProps = {
  typeName: string;
  subtitle: string;
  canExport: boolean;
  exporting: boolean;
  exportFailed: boolean;
  onExport: () => void;
};

export function ReportHeader({ typeName, subtitle, canExport, exporting, exportFailed, onExport }: ReportHeaderProps) {
  return (
    <header className="mb-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <Title order={1} fz={28} fw={800} lh={1.1}>
          Summary — {typeName}
        </Title>
        <Button
          variant="default"
          disabled={!canExport}
          loading={exporting}
          onClick={onExport}
          className="whitespace-nowrap print:hidden"
        >
          Export PDF
        </Button>
      </div>
      <p className="m-0 text-[14px] opacity-65">{subtitle}</p>
      {exportFailed ? (
        <p role="alert" className="mb-0 mt-2 text-[13px] text-accent-700 print:hidden">
          Could not prepare the export. Try again.
        </p>
      ) : null}
    </header>
  );
}
