export interface IPerson {
  Id: string | number,
  FullName: string,
  DateOfBirth: Date,
  DateOfBirthStr: string,
  Age: number,
  PlaceOfBirth: string,
  Gender: number,
  FlatConnections: any[]
}

export enum eGender {
  Male = 0,
  Female = 1
}

export interface IPersonOption {
  text: string,
  value: number
}

export interface IdToName {
  Id: number,
  Name: string
}

