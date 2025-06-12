import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  PlusCircle,
  MoreVertical,
  Edit3,
  X as CloseIcon,
} from 'lucide-react';

const defaultIncidents = [
  {
    id: 1,
    reporter: 'Anna Meier',
    classification: 'General',
    attackType: 'Denial of Service',
    assetDetails: '-',
    description:
      'Unauthorized access was detected on the admin dashboard of our product configuration platform. The attacker exploited a known vulnerability in an outdated third-party authentication module.',
    correctiveAction: [
      'Immediate isolation of affected service instance.',
      'Revoked exposed admin credentials.',
      'Patched authentication module to version 2.3.7.',
      'Monitored traffic logs for any additional indicators of compromise (IOCs).',
    ],
    rootCause:
      'Outdated third-party dependency with a known critical vulnerability was not updated due to oversight in dependency tracking and patching workflow.',
    scope: [
      'Applies to all internal tools handling access management.',
      'Assessment of all third-party libraries for similar outdated dependencies.',
      'Review and improvement of the CI/CD patching pipeline.',
    ],
    preventiveAction: [
      'Implemented automated dependency scanning in the CI pipeline (using Snyk).',
      'Quarterly third-party library audit introduced.',
      'Introduced role-based access control review every 6 months.',
      'Scheduled awareness training for internal developers on secure dependencies.',
    ],
    attachments: [
      {
        name: 'Internal Memo 82.4',
        type: 'Policy',
        version: '1.0',
        dateAdded: '01.01.2025',
        addedBy: 'Emily Carter',
        lastEdited: '01.01.2025',
        editedBy: 'Emily Carter',
      },
      {
        name: 'Cyber Quality Check',
        type: 'Procedure',
        version: '2.35',
        dateAdded: '01.01.2025',
        addedBy: 'Emily Carter',
        lastEdited: '01.01.2025',
        editedBy: 'Emily Carter',
      },
    ],
  },
];

const defaultIncidentSummaryFields = [
  { key: 'reporter', label: 'Reporter' },
  { key: 'classification', label: 'Classification' },
  { key: 'attackType', label: 'Attack Type' },
  { key: 'assetDetails', label: 'Asset Details' },
];

const defaultSectionTitles = {
  description: 'Description',
  correctiveAction: 'Corrective Action',
  rootCause: 'Root Cause',
  scope: 'Scope',
  preventiveAction: 'Preventive Action',
  attachments: 'Attachments',
};

const defaultAttachmentTableHeaders = [
  'Name',
  'Type',
  'Version',
  'Date Added',
  'Added by',
  'Last Edited',
  'Edited by',
  '',
];

const IncidentItem = ({
  incident,
  summaryFields = defaultIncidentSummaryFields,
  sectionTitles = defaultSectionTitles,
  attachmentTableHeaders = defaultAttachmentTableHeaders,
  onEdit,
  onClose,
}) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    setIsToggled(!isToggled);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(incident.id);
    } else {
      console.log('Edit clicked for incident:', incident.id);
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    if (onClose) {
      onClose(incident.id);
    } else {
      console.log('Close clicked for incident:', incident.id);
    }
  };

  const actionButtonClass =
    'flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed';
  const iconButtonClass =
    'p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-md';

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white font-sans shadow-sm">
      <div
        className="flex cursor-pointer items-center p-3 hover:bg-gray-50 sm:p-4"
        onClick={handleToggle}
      >
        <div className="mr-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsToggled(!isToggled);
            }}
            className={`${iconButtonClass} hover:bg-gray-100`}
            aria-expanded={isToggled}
            aria-label={
              isToggled
                ? 'Collapse incident details'
                : 'Expand incident details'
            }
          >
            {isToggled ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          {summaryFields.map((field) => (
            <div key={field.key}>
              <span className="block text-xs font-semibold text-gray-500">
                {field.label}
              </span>
              {/* @ts-ignore */}
              <span className="text-gray-800">{incident[field.key]}</span>
            </div>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center space-x-2 pl-2">
          <button
            type="button"
            onClick={handleEditClick}
            disabled
            className={`${actionButtonClass} hover:border-indigo-500 hover:text-indigo-600`}
            aria-label={`Edit incident ${incident.id}`}
          >
            <Edit3 size={14} className="mr-1" /> Edit
          </button>
          <button
            type="button"
            onClick={handleCloseClick}
            disabled
            className={`${actionButtonClass} hover:border-red-500 hover:text-red-600`}
            aria-label={`Close incident ${incident.id}`}
          >
            <CloseIcon size={14} className="mr-1" /> Close
          </button>
        </div>
      </div>

      {isToggled && (
        <div className="border-t border-gray-200 p-3 sm:p-4">
          <div className="space-y-4 text-sm text-gray-700">
            <Section
              title={sectionTitles.description}
              content={incident.description}
            />
            <Section
              title={sectionTitles.correctiveAction}
              items={incident.correctiveAction}
            />
            <Section
              title={sectionTitles.rootCause}
              content={incident.rootCause}
            />
            <Section title={sectionTitles.scope} items={incident.scope} />
            <Section
              title={sectionTitles.preventiveAction}
              items={incident.preventiveAction}
            />

            {/* Attachments Section */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  {sectionTitles.attachments}
                </h3>
                <button
                  type="button"
                  disabled
                  className={`${actionButtonClass} border-gray-500 bg-indigo-50 text-black hover:bg-indigo-100`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <PlusCircle size={16} className="mr-1.5" />
                  Add Document
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {attachmentTableHeaders.map((header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-3 py-2 text-left font-medium uppercase tracking-wider text-gray-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {incident.attachments.map((file, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-2 text-gray-800">
                          {file.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          {file.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          {file.version}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          {file.dateAdded}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          {file.addedBy}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          {file.lastEdited}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          {file.editedBy}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-indigo-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({
  title,
  content,
  items,
}: {
  title: string;
  content?: any;
  items?: any[];
}) => (
  <div>
    <h3 className="mb-1 text-sm font-semibold text-gray-800">{title}</h3>
    {content && <p className="whitespace-pre-wrap text-gray-600">{content}</p>}
    {items && (
      <ul className="list-inside list-disc space-y-1 pl-1 text-gray-600">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )}
  </div>
);

const IncidentReportList = ({
  incidents = defaultIncidents,
  incidentSummaryFields = defaultIncidentSummaryFields,
  sectionTitles = defaultSectionTitles,
  attachmentTableHeaders = defaultAttachmentTableHeaders,
  handleEditIncident = (id) =>
    console.log(`Edit action triggered for incident ${id}.`),
  handleCloseIncident = (id) =>
    console.log(`Close action triggered for incident ${id}.`),
}) => {
  const [currentIncidents, setCurrentIncidents] = useState(incidents);

  const closeIncident = (id) => {
    setCurrentIncidents((prevIncidents) =>
      prevIncidents.filter((inc) => inc.id !== id)
    );
    console.log(`Incident ${id} closed and removed from list.`);
  };

  const editIncident = (id) => {
    console.log(`Edit action triggered for incident ${id}.`);
  };

  return (
    <div className="mt-6 w-full">
      {currentIncidents.length > 0 ? (
        currentIncidents.map((incident) => (
          <IncidentItem
            key={incident.id}
            incident={incident}
            summaryFields={incidentSummaryFields}
            sectionTitles={sectionTitles}
            attachmentTableHeaders={attachmentTableHeaders}
            onEdit={handleEditIncident || editIncident}
            onClose={handleCloseIncident || closeIncident}
          />
        ))
      ) : (
        <p className="text-center text-gray-500">No incidents to display.</p>
      )}
    </div>
  );
};

export default IncidentReportList;
