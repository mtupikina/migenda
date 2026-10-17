import { z } from 'zod';

export const TEAM_NAME_MAX = 50;

export const TEAM_ROLES = ['owner', 'member'] as const;

export const teamRoleSchema = z.enum(TEAM_ROLES);

export type TeamRole = z.infer<typeof teamRoleSchema>;

export const teamMemberSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  /** The person's job title from their profile, for example "Operations Manager". */
  jobTitle: z.string(),
  avatarUrl: z.string().optional(),
  role: teamRoleSchema,
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

/** Someone who has been invited to the team and has not answered yet. */
export const pendingMemberSchema = z.object({
  /** The id of the invitation. */
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  avatarUrl: z.string().optional(),
});

export type PendingMember = z.infer<typeof pendingMemberSchema>;

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The signed-in user's role in this team. */
  role: teamRoleSchema,
  members: z.array(teamMemberSchema),
  pending: z.array(pendingMemberSchema),
});

export type Team = z.infer<typeof teamSchema>;

export const renameTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a team name')
    .max(TEAM_NAME_MAX, `Use ${TEAM_NAME_MAX} characters or fewer`),
});

export type RenameTeamInput = z.infer<typeof renameTeamSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/** An invitation the signed-in user has received and not yet answered. */
export const teamInviteSchema = z.object({
  id: z.string(),
  teamName: z.string(),
  invitedBy: z.string(),
});

export type TeamInvite = z.infer<typeof teamInviteSchema>;
