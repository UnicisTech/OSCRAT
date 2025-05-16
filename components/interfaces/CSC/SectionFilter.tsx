import React, { Dispatch, SetStateAction } from 'react';
import Select from '@atlaskit/select';
import { getSectionFilterOptions } from '@/components/defaultLanding/data/configs/csc';
import { WithoutRing } from 'sharedStyles';
import type { ISO } from '@/types';

const SectionFilter = ({
  iso,
  setSectionFilter,
}: {
  iso: ISO;
  setSectionFilter: Dispatch<
    SetStateAction<Array<{ label: string; value: string }> | null>
  >;
}) => {
  const options = getSectionFilterOptions(iso);

  return (
    <div style={{ margin: "0 5px" }}>
      <WithoutRing>
        <Select
          inputId="multi-select-section-filter"
          className="multi-select"
          classNamePrefix="react-select"
          options={options}
          onChange={(value) => {
            setSectionFilter([...value]);
          }}
          placeholder="Choose a section"
          isMulti
        />
      </WithoutRing>
    </div>
  );
};

export default SectionFilter;
