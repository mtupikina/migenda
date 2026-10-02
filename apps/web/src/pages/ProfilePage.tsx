import { Box, Loader, Stack } from '@mantine/core';

import { AppNav } from '../components/AppNav';
import { ProfileAvatarCard } from '../components/profile/ProfileAvatarCard';
import { ProfileDeleteAccountCard } from '../components/profile/ProfileDeleteAccountCard';
import { ProfileHeading } from '../components/profile/ProfileHeading';
import { ProfileNotificationsCard } from '../components/profile/ProfileNotificationsCard';
import { ProfilePasswordCard } from '../components/profile/ProfilePasswordCard';
import { ProfilePersonalInfoCard } from '../components/profile/ProfilePersonalInfoCard';
import { useRequireAuth } from '../hooks/useRequireAuth';

export function ProfilePage() {
  const { data: user, isLoading } = useRequireAuth();

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={760} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        <ProfileHeading />
        {isLoading || !user ? (
          <Loader color="accent" />
        ) : (
          <Stack gap={24}>
            <ProfileAvatarCard user={user} />
            <ProfilePersonalInfoCard user={user} />
            <ProfilePasswordCard user={user} />
            <ProfileNotificationsCard user={user} />
            <ProfileDeleteAccountCard />
          </Stack>
        )}
      </Box>
    </Box>
  );
}
