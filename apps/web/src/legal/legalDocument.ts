type LegalSectionContent = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocumentContent = {
  title: string;
  updated: string;
  sections: LegalSectionContent[];
  otherHref: string;
  otherLabel: string;
};
