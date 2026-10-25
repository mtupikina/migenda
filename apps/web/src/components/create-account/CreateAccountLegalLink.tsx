import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Anchor } from '@mantine/core';

type CreateAccountLegalLinkProps = {
  to: string;
  className?: string;
  children: string;
};

function keepCheckboxStill(event: MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation();
}

export function CreateAccountLegalLink({ to, className, children }: CreateAccountLegalLinkProps) {
  return (
    <Anchor
      component={Link}
      to={to}
      target="_blank"
      rel="noreferrer"
      fz={13}
      c="accent.7"
      className={className}
      onClick={keepCheckboxStill}
    >
      {children}
    </Anchor>
  );
}
