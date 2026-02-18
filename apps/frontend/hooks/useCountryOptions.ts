import { useMemo } from 'react';
import countryList from 'react-select-country-list';
import { getCountryCallingCode } from 'libphonenumber-js';

interface CountryOption {
  value: string;
  label: string;
}

export function useCountryOptions(): CountryOption[] {
  return useMemo(() => {
    return countryList()
      .getData()
      .filter((country: CountryOption) => {
        try {
          getCountryCallingCode(country.value as any);
          return true;
        } catch {
          return false;
        }
      });
  }, []);
}
