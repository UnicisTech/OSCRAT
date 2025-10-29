import Files from './allTabs/files';
import Sbom from './allTabs/sbom';
import VersionLog from './allTabs/versionLog';
import Repository from './allTabs/repository';
import Incidents from './allTabs/incidents';
import Vulnerabilities from './allTabs/vulnerabilities';
import Scans from './allTabs/scans';
import Task from './allTabs/task';

const TABS_CONFIG = [
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
    id: 'incidents',
    label: 'oscrat.ui.versions.tabs.incidents',
    component: <Incidents />,
  },
  { id: 'task', label: 'oscrat.ui.versions.tabs.task', component: <Task /> },
  {
    id: 'version-log',
    label: 'oscrat.ui.versions.tabs.version-log',
    component: <VersionLog />,
  },
  {
    id: 'repository',
    label: 'oscrat.ui.versions.tabs.repository',
    component: <Repository />,
  },
];

export default TABS_CONFIG;
