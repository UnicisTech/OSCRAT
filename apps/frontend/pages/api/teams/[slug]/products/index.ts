import { prisma } from '@/lib/prisma';
import { getProducts, createProduct } from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductCreate } from '@oscrat/model';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get all products
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const products = await getProducts(prisma, teamMember.teamId);

  res.status(200).json({ data: products });
};

// Create product
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const productData = req.body as OscratProductCreate;

  const product = await createProduct(prisma, teamMember.teamId, productData, req.auditInfo);

  console.log(
    `[OSCRAT] product created, productId: ${product.id}, name: ${productData.name}, teamId: ${teamMember.teamId}`
  );

  res.status(201).json({ data: product });
};
