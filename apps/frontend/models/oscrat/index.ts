export {
  createVersionAttachment,
  getVersionAttachments,
  getVersionAttachmentById,
  getVersionAttachmentWithData,
  deleteVersionAttachment,
  readFile as readVersionAttachmentFile,
  saveFileAsVersionAttachment,
  checkExtensionAndMIMEType as checkVersionAttachmentFile,
} from './versionAttachment';

export {
  uploadVersionCAR,
  deleteVersionCAR,
  getVersionCAR,
  uploadVersionDoC,
  deleteVersionDoC,
  getVersionDoC,
} from './versionDoc';
