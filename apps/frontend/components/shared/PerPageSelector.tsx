import React, { useRef, Dispatch, SetStateAction } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

const perPageOptions: { label: string; value: number }[] = [
  {
    label: '5',
    value: 5,
  },
  {
    label: '10',
    value: 10,
  },
  {
    label: '25',
    value: 25,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];

interface PerPageSelectorProps {
  perPage: number;
  setPerPage: Dispatch<SetStateAction<number>>;
}

const PerPageSelector = ({ perPage, setPerPage }: PerPageSelectorProps) => {
  const tabRef = useRef<HTMLUListElement | null>(null);
  return (
    <div className="z-50 px-4">
      <div className="dropdown w-full">
        <div
          onClick={() => {
            if (tabRef.current) {
              tabRef.current.style.display = 'block';
            }
          }}
          tabIndex={0}
          className="border-line bg-surface text-content hover:bg-surface-muted rounded-input flex cursor-pointer items-center justify-between border px-4 py-1.5 text-sm font-bold transition-colors"
        >
          <div>{perPage}</div>
          <ChevronUpDownIcon className="h-5 w-5" />
        </div>
        <ul
          ref={tabRef}
          tabIndex={0}
          className="dropdown-content bg-surface border-line shadow-4 rounded-input w-full border p-2 px-2"
        >
          {perPageOptions.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (tabRef.current) {
                  tabRef.current.style.display = 'none';
                }
                setPerPage(item.value);
              }}
              className="hover:bg-surface-muted focus:bg-surface-muted flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm font-medium focus:outline-none"
            >
              {item.label}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PerPageSelector;
