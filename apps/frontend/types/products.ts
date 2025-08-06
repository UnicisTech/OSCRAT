export type Product = {
  id: number;
  title: string;
  category: string;
  role: string;
  openIncidents: number;
  openVulnerabilities?: number | null;
  externalReporting?: string | null;
  // Fields for filtering, even if not directly in ProductProps display
  addedBy: string;
  lastAdded: string; // String for simplicity, can be Date object for advanced filtering
};
