import { z } from 'zod';

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

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The signed-in user's role in this team. */
  role: teamRoleSchema,
  members: z.array(teamMemberSchema),
});

export type Team = z.infer<typeof teamSchema>;
