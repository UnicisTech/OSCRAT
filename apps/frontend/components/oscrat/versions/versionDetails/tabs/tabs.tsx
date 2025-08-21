import Files from './allTabs/files';
import Sbom from './allTabs/sbom';
import VersionLog from './allTabs/versionLog';
import Repository from './allTabs/repository';
import Incidents from './allTabs/incidents';
import Vulnerabilities from './allTabs/vulnerabilities';
import Task from './allTabs/task';

const TABS_CONFIG = [
  { id: 'files', label: 'Files', component: <Files /> },
  { id: 'sbom', label: 'SBOM', component: <Sbom /> },
  {
    id: 'vulnerabilities',
    label: 'Vulnerabilities',
    component: <Vulnerabilities />,
  },
  { id: 'incidents', label: 'Incidents', component: <Incidents /> },
  { id: 'task', label: 'Task', component: <Task /> },
  { id: 'version-log', label: 'Version Log', component: <VersionLog /> },
  { id: 'repository', label: 'Repository', component: <Repository /> },
];

export default TABS_CONFIG;
