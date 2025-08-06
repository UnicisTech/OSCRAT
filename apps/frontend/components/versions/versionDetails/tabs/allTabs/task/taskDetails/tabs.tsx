import Files from './tabs/files';
import Audit from './tabs/audit';
import Comments from './tabs/comments';

const TABS_CONFIG = [
  { id: 'files', label: 'Files', component: <Files /> },
  { id: 'audit', label: 'Audit Log', component: <Audit /> },
  { id: 'comments', label: 'Comments', component: <Comments /> },
];

export default TABS_CONFIG;
