export interface IPerson {
  Id: string | number,
  FullName: string,
  DateOfBirth: Date,
  DateOfBirthStr: string,
  PlaceOfBirth: string,
  Gender: number,
  Age: number,
  //FlatConnections: any[]
}

export enum eGender {
  Male = 0,
  Female = 1
}

export interface IPersonOption {
  text: string,
  value: number
}

