import type { LegalDocumentContent } from './legalDocument';

export const privacyDocument: LegalDocumentContent = {
  title: 'Privacy Policy',
  updated: '25 October 2026',
  otherHref: '/terms',
  otherLabel: 'Terms',
  sections: [
    {
      heading: 'What we store',
      paragraphs: [
        'When you create an account we store your name, email, and a hash of your password. If you sign in with Google or GitHub we store the name and email those services send us. We also store the events, types, notes, blocked time, team membership, invites, profile photo, and notification preferences you add.',
      ],
    },
    {
      heading: 'How we use it',
      paragraphs: [
        'We use this data to run your account, show the schedule to you and the teammates you invite, send a password-reset email when you ask for one, and email you about shift changes or scheduling conflicts if those toggles are on.',
      ],
    },
    {
      heading: 'Cookies',
      paragraphs: [
        'We keep you signed in with an httpOnly cookie. The cookie is not used for advertising.',
      ],
    },
    {
      heading: 'Who can see it',
      paragraphs: [
        'Teammates on a team you belong to can see the schedule and notes on that team. We do not sell your data. We send email through our mail provider when you reset a password or when a notification you enabled fires.',
      ],
    },
    {
      heading: 'How long we keep it',
      paragraphs: [
        'We keep your account until you delete it. Delete account on your profile removes your account and the data attached to it.',
      ],
    },
    {
      heading: 'Your choices',
      paragraphs: [
        'You can edit your name, email, password, photo, and notification toggles on your profile. You can leave a team or remove someone you invited. You can delete your account.',
      ],
    },
  ],
};
