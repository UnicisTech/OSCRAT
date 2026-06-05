import type { NextApiRequest, NextApiResponse } from 'next';
import * as Yup from 'yup';
import { getPublicDocumentation } from 'models/documentation';
import { ApiError } from '@/lib/errors';
import { validateRequest } from '@/lib/validation/validateRequest';
import type { DocumentationDetails } from '@oscrat/model';

const querySchema = Yup.object({
  slug: Yup.string().required('Team slug is required'),
  productId: Yup.string().required('Product ID is required'),
  versionId: Yup.string().required('Version ID is required'),
  docSlug: Yup.string().required('Document slug is required'),
});

/**
 * Public product documentation access endpoint
 * No authentication required - only returns PUBLISHED + PUBLIC documentation
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    throw new ApiError(405, `Method ${req.method} Not Allowed`);
  }

  const { slug, productId, versionId, docSlug } = await validateRequest(
    querySchema,
    req.query
  );
  const doc = await getPublicDocumentation(slug, docSlug, {
    productId,
    versionId,
    includeContent: true,
  }) as DocumentationDetails | null;

  if (!doc) {
    throw new ApiError(404, 'Documentation not found');
  }

  return res.status(200).json({
    data: {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      content: doc.content,
      version: doc.version,
      productId: doc.productId,
      productName: doc.productName,
      versionId: doc.versionId,
      versionName: doc.versionName,
      updatedAt: doc.updatedAt,
    },
    error: null,
  });
}
