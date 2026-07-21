import { MatDateFormats } from '@angular/material/core';

/** Date display/parse formats matching the original moment.js usage. */
export const WD_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'MM/DD/YYYY' },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
