/**
 * Filter options for entity-specific attachments
 * Used to link attachments to specific entities (vulnerabilities, incidents, etc.)
 */
export interface AttachmentEntityFilters {
  vulnerabilityId?: string;
  incidentId?: string;
}
