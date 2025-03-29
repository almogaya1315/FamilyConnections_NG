export interface IPerson {
  Id: string | number,
  FullName: string,
  DateOfBirth: Date,
  PlaceOfBirth: string,
  Gender: eGender,
  Age: number
}

export enum eGender {
  Male,
  Female
}

