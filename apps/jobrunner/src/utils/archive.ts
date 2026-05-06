import AdmZip from 'adm-zip';

export interface ZippedFile {
  filename: string;
  data: Buffer;
}

export const createSingleFileZip = (
  entryFilename: string,
  data: Buffer
): ZippedFile => {
  const zip = new AdmZip();
  zip.addFile(entryFilename, data);
  return {
    filename: entryFilename.replace(/\.[^./]+$/, '') + '.zip',
    data: zip.toBuffer(),
  };
};
