import type { LegalDocumentContent } from './legalDocument';

export const termsDocument: LegalDocumentContent = {
  title: 'Terms',
  updated: '25 October 2026',
  otherHref: '/privacy',
  otherLabel: 'Privacy Policy',
  sections: [
    {
      heading: 'What MiGenda is',
      paragraphs: [
        'MiGenda is a team scheduling app. You can create an account, plan events on a calendar, invite people to a team, leave notes on bookings, and run reports.',
      ],
    },
    {
      heading: 'Your account',
      paragraphs: [
        'You need a name, email, and password — or you can sign in with Google or GitHub. You are responsible for the activity on your account. Keep your password to yourself.',
      ],
    },
    {
      heading: 'Teams and content',
      paragraphs: [
        'Events, types, notes, and blocked time you add belong to the team they sit on. People you invite can see that team’s schedule according to the access you give them. Do not put secrets in notes or event titles that your teammates should not see.',
      ],
    },
    {
      heading: 'Acceptable use',
      paragraphs: [
        'Use MiGenda for scheduling work with people who agreed to join your team. Do not try to break the service, scrape other people’s calendars, or use an account that is not yours.',
      ],
    },
    {
      heading: 'Availability',
      paragraphs: [
        'We run MiGenda so you can plan the week. We may change or pause the service to keep it working. We are not liable for missed shifts or decisions you make from the schedule.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'We may update these terms. The date at the top of this page is the version that applies when you create an account or keep using MiGenda.',
      ],
    },
  ],
};
