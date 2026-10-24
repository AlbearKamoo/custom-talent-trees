import TalentIcon from './TalentIcon';

interface TreeHeaderProps {
  name: string;
  icon: string;
  spent: number;
  capacity: number;
  active?: boolean;
  onClick?: () => void;
  onReset?: () => void;
}

const TreeHeader: React.FC<TreeHeaderProps> = ({
  name,
  icon,
  spent,
  capacity,
  active = false,
  onClick,
  onReset,
}) => {
  const className = `flex items-center gap-3 w-full px-3 py-2 border-b ${
    active
      ? 'bg-gray-800 border-yellow-600'
      : 'bg-gray-900 border-gray-700'
  } ${onClick ? 'hover:bg-gray-800 cursor-pointer' : ''}`;

  const content = (
    <>
      <div className="flex-shrink-0 rounded-full overflow-hidden border border-gray-600 bg-gray-800">
        <TalentIcon icon={icon} name={name} size={28} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="truncate font-semibold text-yellow-400">{name}</div>
      </div>
      <div className="flex-shrink-0 text-sm font-semibold tabular-nums text-gray-200">
        {spent} / {capacity}
      </div>
      {onReset && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="flex-shrink-0 px-2 py-1 text-xs rounded bg-red-800 hover:bg-red-700 text-white"
        >
          Reset
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
};

export default TreeHeader;
