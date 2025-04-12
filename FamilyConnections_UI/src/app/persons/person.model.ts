export interface IPerson {
  Id: string | number,
  FullName: string,
  DateOfBirth: Date,
  DateOfBirthStr: string,
  Age: number,
  PlaceOfBirth: string,
  Gender: number,
  FlatConnections: any[],
  Password: string
}

export enum eGender {
  Male = 0,
  Female = 1
}

export interface IPersonCredentials {
  FullName: string,
  Id: number,
  Password: string
}

export interface ILoginResponse {
  Valid: boolean,
  Message: string,
}
