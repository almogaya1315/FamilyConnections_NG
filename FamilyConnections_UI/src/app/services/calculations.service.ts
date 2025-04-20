import { Injectable } from '@angular/core';
import { eGender, eRel, IConnection, IFlatConnection, IPerson, IUndecidedConnection } from '../persons/person.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {
  private _personConn: IConnection | null = null;
  private _relatedConn: IConnection | null = null;
  private _conns: IConnection[] = [];

  constructor() {
  }

  initCalculation(personConn: IConnection, relatedConn: IConnection, conns: IConnection[]) {
    this._personConn = personConn;
    this._relatedConn = relatedConn;
    this._conns = conns;
  }

  opposite(flatCon: IFlatConnection, relatedPerson: IPerson): eRel {
    let oppositeRel = eRel.FarRel;
    let relation = flatCon.RelationshipId as eRel;
    let gender = relatedPerson.Gender;

    switch (relation) {
      case eRel.Mother:
      case eRel.Father:
        oppositeRel = gender == eGender.Female ? eRel.Daughter : eRel.Son;
        break;
      case eRel.Sister:
      case eRel.Brother:
        oppositeRel = gender == eGender.Female ? eRel.Sister : eRel.Brother;
        break;
      case eRel.Daughter:
      case eRel.Son:
        oppositeRel = gender == eGender.Female ? eRel.Mother : eRel.Father;
        break;
      case eRel.Wife:
        oppositeRel = eRel.Husband;
        break;
      case eRel.Husband:
        oppositeRel = eRel.Wife;
        break;
      case eRel.Aunt:
      case eRel.Uncle:
        oppositeRel = gender == eGender.Female ? eRel.Niece : eRel.Nephew;
        break;
      case eRel.Cousin:
        oppositeRel = eRel.Cousin;
        break;
      case eRel.Niece:
      case eRel.Nephew:
        oppositeRel = gender == eGender.Female ? eRel.Aunt : eRel.Uncle;
        break;
      case eRel.GrandMother:
      case eRel.GrandFather:
        oppositeRel = eRel.GrandChild;
        break;
      case eRel.GrandChild:
        oppositeRel = gender == eGender.Female ? eRel.GrandMother : eRel.GrandFather;
        break;
      case eRel.MotherInLaw:
      case eRel.FatherInLaw:
        oppositeRel = gender == eGender.Female ? eRel.DaughterInLaw : eRel.SonInLaw;
        break;
      case eRel.SisterInLaw:
      case eRel.BrotherInLaw:
        oppositeRel = gender == eGender.Female ? eRel.SisterInLaw : eRel.BrotherInLaw;
        break;
      case eRel.DaughterInLaw:
      case eRel.SonInLaw:
        oppositeRel = gender == eGender.Female ? eRel.MotherInLaw : eRel.FatherInLaw;
        break;
      case eRel.StepMother:
      case eRel.StepFather:
        oppositeRel = gender == eGender.Female ? eRel.StepDaughter : eRel.StepSon;
        break;
      case eRel.StepSister:
      case eRel.StepBrother:
        oppositeRel = gender == eGender.Female ? eRel.StepSister : eRel.StepBrother;
        break;
      case eRel.StepDaughter:
      case eRel.StepSon:
        oppositeRel = gender == eGender.Female ? eRel.StepMother : eRel.StepFather;
        break;
      case eRel.ExPartner:
        oppositeRel = eRel.ExPartner;
        break;
      case eRel.GreatGrandMother:
      case eRel.GreatGrandFather:
        oppositeRel = gender == eGender.Female ? eRel.GreatGrandDaughter : eRel.GreatGrandSon;
        break;
      case eRel.GreatGrandDaughter:
      case eRel.GreatGrandSon:
        oppositeRel = gender == eGender.Female ? eRel.GreatGrandMother : eRel.GreatGrandFather;
        break;
      case eRel.FarRel:
        oppositeRel = eRel.FarRel;
        break;
    }

    return oppositeRel;
  }

  findRelation(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]
  ): eRel | null {
    let relation: eRel | null = checkParent(possibleComplexRel, undecidedConns);
    if (!relation) relation = checkChild(possibleComplexRel, undecidedConns);
    if (!relation) relation = checkSibling(possibleComplexRel, undecidedConns);
    if (!relation) relation = checkSpouse(possibleComplexRel, undecidedConns);
    if (!relation) relation = checkParentSibling(possibleComplexRel, undecidedConns);
    if (!relation) relation = checkSiblingInLaw(possibleComplexRel, undecidedConns);
    if (!relation) relation = FarRelation(undecidedConns);
    return relation;
  }

  private checkParent(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {

    //person's Parent
    if (this.hasParent(this._personConn!)) {
      //HasParent
    }

  }

  // Has Methods
  private hasParent(conn: IConnection) {
    return conn.Relationship?.Type == eRel.Mother || conn.Relationship?.Type == eRel.Father;
  }

}
