import React from 'react';

const defaultStages = [
  { id: 'start', label: 'Start' },
  { id: 'declared', label: 'Declared' },
  { id: 'stable', label: 'Stable' },
  { id: 'active', label: 'Active' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'completed', label: 'Completed' },
];

const IncidentStatusBar = ({
  stages = defaultStages,
  addButtonText = 'Add Incident',
}) => {
  const [activeStage, setActiveStage] = React.useState(
    stages.length > 0 ? stages[0].id : 'start'
  );

  const baseButtonStyles =
    'px-4 py-2 text-sm font-medium border-t border-b focus:outline-none transition-colors duration-150';

  const stageButtonStyles = `${baseButtonStyles} border-l last:border-r rounded-none first:rounded-l-md last:rounded-r-md`;

  const activeStageStyles = 'bg-blue-500 text-white';

  const inactiveStageStyles =
    'bg-white text-gray-700 hover:bg-gray-100 border-gray-300';

  const disabledButtonStyles =
    'disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between rounded-lg">
        <div className="flex">
          {stages.map((stage, index) => (
            <button
              key={stage.id}
              type="button"
              disabled
              className={` ${stageButtonStyles} ${activeStage === stage.id ? activeStageStyles : inactiveStageStyles} ${disabledButtonStyles} ${index === 0 ? 'rounded-l-md' : ''} ${index === stages.length - 1 ? 'rounded-r-md border-r' : ''} `}
              onClick={() => setActiveStage(stage.id)}
            >
              {stage.label}
            </button>
          ))}
        </div>

        <div>
          <button
            type="button"
            disabled
            className={` ${baseButtonStyles} rounded-md border border-gray-500 bg-white text-black ${disabledButtonStyles} `}
          >
            {addButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentStatusBar;
