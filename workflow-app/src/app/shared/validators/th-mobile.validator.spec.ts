import { AbstractControl, ValidationErrors } from '@angular/forms';

export const thMobile = (c: AbstractControl): ValidationErrors | null => {
  const value = c.getRawValue();
  
  // Check if the mobile number starts with 06, 08, or 09 and is 10 digits long
  if (/^(06|08|09)\d{8}$/.test(value)) {
    return null; // Valid
  }
  
  // If it's not valid, return the custom validation error
  return { thMobile: true };
};
