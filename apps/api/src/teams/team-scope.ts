import type { Types } from 'mongoose';

import type { UserDocument } from '../auth/user.schema';

/** The signed-in user together with the team their request acts on. */
export type TeamScope = {
  user: UserDocument;
  teamId: Types.ObjectId;
};
