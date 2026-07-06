import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  passportUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
    
  documentUploader: f({ 
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 } 
  })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

type OurFileRouter = typeof ourFileRouter;