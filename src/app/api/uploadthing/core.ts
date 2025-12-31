import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.trainerId) {
        throw new Error('Unauthorized');
      }

      return { trainerId: session.user.trainerId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for trainerId:', metadata.trainerId);
      console.log('File URL:', file.url);

      return { uploadedBy: metadata.trainerId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
