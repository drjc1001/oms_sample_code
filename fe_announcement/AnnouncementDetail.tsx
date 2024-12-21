'use client';

import { FC } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BlockBox from '@/components/ui/BlockBox';
import { colors } from '@/design/colors';
import { Announcement } from '@/models/announcement';

type AnnouncementDetailProps = {
  announcement: Announcement;
};

const AnnouncementDetail: FC<AnnouncementDetailProps> = ({ announcement }) => {
  const router = useRouter();

  return (
    <BlockBox
      title={
        <Box
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4">公告內容</Typography>
          <Button sx={{ width: '160px' }} onClick={() => router.back()}>
            回上一頁
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          p: 1,
        }}
      >
        <Box
          sx={{
            width: '70%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            border: `1px solid ${colors.grey[1]}`,
            p: 1,
          }}
        >
          <Box>
            <Typography>
              {moment
                .unix(announcement.createdAt)
                .utcOffset(8)
                .format('YYYY.MM.DD')}
            </Typography>
            <Typography variant="h4">{announcement.title}</Typography>
          </Box>
          <Divider />
          <Box>
            <div
              dangerouslySetInnerHTML={{ __html: announcement.description }}
            />
          </Box>
          {!!announcement?.attachmentUrls[0] && (
            <>
              <Divider />
              <Box>
                <Typography>檔案下載</Typography>
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href={announcement?.attachmentUrls[0] || ''}
                  style={{ color: colors.blue[1] }}
                >
                  {announcement.attachmentUrls[0]?.split('/')[
                    announcement.attachmentUrls[0]?.split('/').length - 1
                  ] || ''}
                </Link>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </BlockBox>
  );
};

export default AnnouncementDetail;
