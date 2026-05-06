import Files from './allTabs/files';
import Sbom from './allTabs/sbom';
import VersionLog from './allTabs/versionLog';
import Repository from './allTabs/repository';
import Incidents from './allTabs/incidents';
import Vulnerabilities from './allTabs/vulnerabilities';
import Scans from './allTabs/scans';
import Configuration from './allTabs/configuration';
import Task from './allTabs/task';
import Documentation from './allTabs/documentation';
import Compliance from './allTabs/compliance';

const TABS_CONFIG = [
  {
    id: 'compliance',
    label: 'oscrat.ui.versions.tabs.compliance',
    component: <Compliance />,
  },
  { id: 'files', label: 'oscrat.ui.versions.tabs.files', component: <Files /> },
  { id: 'sbom', label: 'oscrat.ui.versions.tabs.sbom', component: <Sbom /> },
  {
    id: 'scans',
    label: 'oscrat.ui.versions.tabs.scans',
    component: <Scans />,
  },
  {
    id: 'vulnerabilities',
    label: 'oscrat.ui.versions.tabs.vulnerabilities',
    component: <Vulnerabilities />,
  },
  {
    id: 'configuration',
    label: 'oscrat.ui.versions.tabs.configuration',
    component: <Configuration />,
  },
  {
    id: 'incidents',
    label: 'oscrat.ui.versions.tabs.incidents',
    component: <Incidents />,
  },
  { id: 'task', label: 'oscrat.ui.versions.tabs.task', component: <Task /> },
  {
    id: 'documentation',
    label: 'oscrat.ui.versions.tabs.documentation',
    component: <Documentation />,
  },
  {
    id: 'repository',
    label: 'oscrat.ui.versions.tabs.repository',
    component: <Repository />,
  },
  {
    id: 'audit-log',
    label: 'oscrat.ui.versions.tabs.audit-log',
    component: <VersionLog />,
  },
];

export default TABS_CONFIG;
