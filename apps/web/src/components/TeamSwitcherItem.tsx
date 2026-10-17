import { Check } from 'lucide-react';
import { Menu } from '@mantine/core';
import type { TeamSummary } from '@migenda/shared';

type TeamSwitcherItemProps = {
  team: TeamSummary;
  onSelect: (teamId: string) => void;
};

export function TeamSwitcherItem({ team, onSelect }: TeamSwitcherItemProps) {
  function select() {
    if (team.active) {
      return;
    }
    onSelect(team.id);
  }

  return (
    <Menu.Item
      fz={14}
      fw={team.active ? 600 : undefined}
      aria-current={team.active ? 'true' : undefined}
      rightSection={team.active ? <Check size={14} aria-hidden /> : null}
      onClick={select}
    >
      {team.name}
    </Menu.Item>
  );
}
