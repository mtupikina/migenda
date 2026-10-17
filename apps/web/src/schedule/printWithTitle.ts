/** Opens the print dialog; browsers use the page title as the suggested PDF file name. */
export function printWithTitle(title: string): void {
  const previous = document.title;
  document.title = title;
  window.addEventListener(
    'afterprint',
    () => {
      document.title = previous;
    },
    { once: true },
  );
  window.print();
}
