/** URL builders for oscrat API endpoints, to keep nested resource paths DRY. */

export const teamApiPath = (teamId: string) => `/teams/${teamId}`;

export const productApiPath = (teamId: string, productId: string) =>
  `${teamApiPath(teamId)}/products/${productId}`;

export const versionApiPath = (
  teamId: string,
  productId: string,
  versionId: string
) => `${productApiPath(teamId, productId)}/versions/${versionId}`;
