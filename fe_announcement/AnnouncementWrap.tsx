'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';

import FilterAnnouncement from '@/components/filter/FilterAnnouncement';
import ListAnnouncement from '@/components/list/ListAnnouncement';
import { AnnouncementApi } from '@/services/announcement/announcement';
import { Announcement } from '@/models/announcement';
import { showErrorToast } from '@/lib/toast';

type AnnouncementWrapProps = {
  isHome: boolean;
};

const AnnouncementWrap: FC<AnnouncementWrapProps> = ({ isHome }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    try {
      (async () => {
        const announcements = await AnnouncementApi.api().getAnnouncements({});
        setAnnouncements(announcements);
      })();
    } catch (error) {
      showErrorToast(error);
    }
  }, []);

  const handleSetAnnouncements = useCallback(
    (announcements: Announcement[]) => setAnnouncements(announcements),
    [],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {!isHome && (
        <FilterAnnouncement handleSetAnnouncements={handleSetAnnouncements} />
      )}
      <ListAnnouncement
        announcements={announcements}
        handleSetAnnouncements={handleSetAnnouncements}
        isHome={isHome}
      />
    </Box>
  );
};

export default AnnouncementWrap;
