export interface IPerson {
  Id: string | number,
  FullName: string,
  DateOfBirth: Date | null,
  DateOfBirthStr: string,
  Age: number,
  PlaceOfBirth: string,
  Gender: eGender,
  FlatConnections: IFlatConnection[],
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
  Person: IPerson
}

export interface IConnection {
  TargetPerson: IPerson | null,
  RelatedPerson: IPerson | null,
  Relationship: IRelationshipInfo | null,
  Flat: IFlatConnection | null
}

export interface IFlatConnection {
  TargetId: number,
  RelatedId: number,
  RelationshipId: number
}

export interface IUndecidedConnection {
  Target: IFlatConnection,
  Related: IFlatConnection,
  FarRelDebug: string,
  Options: eRel[]
}

export interface IRelationshipInfo {
  Id: number,
  Type: eRel | string,
  //Gender: eGender,
  //Opposite: eRel | eComplexRel | eFarRel,
  PossibleComplexRel: eRel | null, //eComplexRel
  //Error: string,
}

export enum eRel {
  Mother = 0,
  Father = 1,
  Sister = 2,
  Brother = 3,
  Daughter = 4,
  Son = 5,
  Wife = 6,
  Husband = 7,
  Aunt = 8,
  Uncle = 9,
  Cousin = 10,
  Niece = 11,
  Nephew = 12,
  GrandMother = 13,
  GrandFather = 14,
  GrandChild = 15,

  //eComplexRel
  MotherInLaw = 16,
  FatherInLaw = 17,
  SisterInLaw = 18,
  BrotherInLaw = 19,
  DaughterInLaw = 20,
  SonInLaw = 21,
  StepMother = 22,
  StepFather = 23,
  StepSister = 24,
  StepBrother = 25,
  StepDaughter = 26,
  StepSon = 27,
  ExPartner = 28,
  GreatGrandMother = 29,
  GreatGrandFather = 30,
  GreatGrandDaughter = 31,
  GreatGrandSon = 32,

  //eFarRel
  FarRel = 33,
  //Wife_BrotherInLaw = 33,
  //Wife_SisterInLaw = 34,
  //Husband_BrotherInLaw = 35,
  //Husband_SisterInLaw = 36,
  //Wife_Niece = 37,
  //Wife_Nephew = 38,
  //Husband_Niece = 39,
  //Husband_Nephew = 40,

  Undecided = 34,
  //Unknown = 35
}

export enum eComplexRel {
  MotherInLaw = 16,
  FatherInLaw = 17,
  SisterInLaw = 18,
  BrotherInLaw = 19,
  DaughterInLaw = 20,
  SonInLaw = 21,
  StepMother = 22,
  StepFather = 23,
  StepSister = 24,
  StepBrother = 25,
  StepDaughter = 26,
  StepSon = 27,
  ExPartner = 28,
  GreatGrandMother = 29,
  GreatGrandFather = 30,
  GreatGrandDaughter = 31,
  GreatGrandSon = 32,
}

export enum eFarRel {
  FarRel = 33
  //Wife_BrotherInLaw = 33,
  //Wife_SisterInLaw = 34,
  //Husband_BrotherInLaw = 35,
  //Husband_SisterInLaw = 36,
  //Wife_Niece = 37,
  //Wife_Nephew = 38,
  //Husband_Niece = 39,
  //Husband_Nephew = 40,
}
