/**
 * Address that serves a course document's PDF through the API, to open it
 * in the browser or (download = true) save it. Use this rather than the
 * stored pdfUrl, which breaks for file names with "#" and can't be
 * downloaded when it points at Cloudinary.
 * @param {{ _id: string }} doc
 * @param {{ download?: boolean }} [options]
 */
export const courseDocumentFileUrl = (doc, { download = false } = {}) =>
  doc?._id
    ? `/api/v1/course-docs/${doc._id}/file${download ? "?download=1" : ""}`
    : undefined;
