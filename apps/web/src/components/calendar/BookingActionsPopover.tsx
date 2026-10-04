import { useLayoutEffect, useRef, useState } from 'react';
import { Popover } from '@mantine/core';
import type { Occurrence } from '@migenda/shared';

import { BookingActionsMenu } from './BookingActionsMenu';

type BookingActionsPopoverProps = {
  occurrence: Occurrence | null;
  anchor: HTMLElement | null;
  completing: boolean;
  duplicating: boolean;
  toast: string | null;
  onClose: () => void;
  onComplete: () => void;
  onDuplicate: () => void;
};

export function BookingActionsPopover({
  occurrence,
  anchor,
  completing,
  duplicating,
  toast,
  onClose,
  onComplete,
  onDuplicate,
}: BookingActionsPopoverProps) {
  const menu = useRef<HTMLDivElement>(null);
  const box = useAnchorBox(anchor);

  useLayoutEffect(() => {
    if (!anchor || !occurrence) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const insideTask = anchor.contains(target);
      const insideMenu = menu.current?.contains(target) ?? false;
      if (insideTask || insideMenu) {
        return;
      }
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [anchor, occurrence, onClose]);

  if (!occurrence || !box) {
    return null;
  }

  return (
    <Popover opened onDismiss={onClose} position="bottom-start" offset={6} shadow="sm" closeOnClickOutside={false}>
      <Popover.Target>
        <span
          className="pointer-events-none fixed"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        />
      </Popover.Target>
      <Popover.Dropdown className="border border-[color-mix(in_srgb,#201e1d_28%,transparent)] bg-white p-2">
        <div ref={menu}>
          <BookingActionsMenu
            occurrence={occurrence}
            completing={completing}
            duplicating={duplicating}
            toast={toast}
            onComplete={onComplete}
            onDuplicate={onDuplicate}
          />
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

function useAnchorBox(anchor: HTMLElement | null): DOMRect | null {
  const [box, setBox] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!anchor) {
      setBox(null);
      return;
    }
    const update = () => setBox(anchor.getBoundingClientRect());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchor]);

  return box;
}
