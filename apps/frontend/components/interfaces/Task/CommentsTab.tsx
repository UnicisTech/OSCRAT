import classNames from 'classnames';
import { taskCommentsNavigations } from '@/lib/tasks';

const CommentsTab = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (name: string) => void;
}) => {
  const navigations = taskCommentsNavigations(activeTab);

  return (
    <div className="mb-5">
      <nav
        className="border-line -mb-px flex space-x-5 border-b"
        aria-label="Tabs"
      >
        {navigations.map((menu, index) => {
          return (
            <a
              key={index}
              className={classNames(
                'inline-flex cursor-pointer items-center border-b-2 py-4 text-sm font-medium',
                menu.active
                  ? 'text-content-secondary border-content'
                  : 'text-content-muted hover:border-line hover:text-content-secondary border-transparent'
              )}
              onClick={() => {
                setActiveTab(menu.name);
              }}
            >
              {menu.name}
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default CommentsTab;
