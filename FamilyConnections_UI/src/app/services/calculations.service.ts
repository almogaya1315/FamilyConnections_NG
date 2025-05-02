import { Injectable } from '@angular/core';
import { eGender, eRel, IConnection, IFlatConnection, IPerson, IUndecidedConnection } from '../persons/person.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {
  private _personConn: IConnection | null = null;
  private _relatedConn: IConnection | null = null;
  private _conns: IConnection[] = [];

  constructor() { }

  // operation Methods
  initCalculation(personConn: IConnection, relatedConn: IConnection, conns: IConnection[]) {
    this._personConn = personConn;
    this._relatedConn = relatedConn;
    this._conns = conns;
  }

  getConns() {
    return this._conns;
  }

  opposite(relation: eRel, gender: eGender): eRel {
    //opposite(flatCon: IFlatConnection, relatedPerson: IPerson): eRel {
    let oppositeRel = eRel.FarRel;
    //let relation = flatCon.RelationshipId as eRel;
    //let gender = relatedPerson.Gender;

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

    if (this._personConn?.TargetPerson?.Id == 1 && this._relatedConn?.RelatedPerson?.Id == 5) {
      let test = '';
    }
    if (this._personConn?.TargetPerson?.Id == 5 && this._relatedConn?.RelatedPerson?.Id == 1) {
      let test = '';
    }

    let relation: eRel | null = this.checkParent(possibleComplexRel, undecidedConns);
    if (!relation) relation = this.checkChild(possibleComplexRel, undecidedConns);
    if (!relation) relation = this.checkSibling(possibleComplexRel, undecidedConns);
    if (!relation) relation = this.checkSpouse(possibleComplexRel, undecidedConns);
    if (!relation) relation = this.checkParentSibling(possibleComplexRel, undecidedConns);
    if (!relation) relation = this.checkSiblingChild(possibleComplexRel, undecidedConns);
    if (!relation) relation = this.checkSiblingInLaw(possibleComplexRel, undecidedConns);
    if (!relation) relation = this.farRelation(undecidedConns);

    let relName = eRel[relation];
    return relation;
  }

  connectBetween(
    person: IPerson, relatedPerson: IPerson | null, relation: eRel | null,
    newConns: IConnection[], possibleComplexRel: { val: eRel | null; }, possibleComplex_debug: IConnection[], opposite: boolean = false,
    createConnection: (person: IPerson, related: IPerson, relation: eRel, complexRel: eRel | null) => IConnection | null) {

    if (relation == eRel.FarRel || relation == eRel.Undecided) return;

    if (opposite) {
      relation = this.opposite(relation!, relatedPerson!.Gender);
      if (possibleComplexRel != undefined && possibleComplexRel?.val != null) possibleComplexRel.val = this.opposite(possibleComplexRel.val!, relatedPerson!.Gender);
    }

    if (!this.conExists(person, relatedPerson!, relation!, newConns)) {
      let newConn: IConnection = createConnection(person, relatedPerson!, relation!, possibleComplexRel?.val)!;
      if (possibleComplexRel.val) possibleComplex_debug.push(newConn);
      newConns.push(newConn);
      this._conns.push(newConn);

      let existsInFlat = person.FlatConnections.some(f => f.TargetId == person.Id && f.RelatedId == relatedPerson?.Id);
      if (!existsInFlat) person.FlatConnections.push(newConn.Flat!);
    }

    if (!opposite) {
      this.connectBetween(relatedPerson!, person, relation, newConns, possibleComplexRel, possibleComplex_debug, opposite = true, createConnection);
    }
  }

  private conExists(person: IPerson, related: IPerson, relation: eRel, newConns: IConnection[]) {
    let existsInNew = newConns.some(c => c.TargetPerson?.Id == person.Id && c.RelatedPerson?.Id == related.Id); // && c.Relationship?.Type == eRel[relation]
    let existsInAll = this._conns.some(c => c.TargetPerson?.Id == person.Id && c.RelatedPerson?.Id == related.Id); // && c.Relationship?.Type == eRel[relation]
    return existsInNew || existsInAll;
  }

  anyConExists(person: IPerson, related: IPerson) {
    return this._conns.some(c => c.TargetPerson?.Id == person.Id && c.RelatedPerson?.Id == related.Id);
  }

  private farRelation(undecidedConns: IUndecidedConnection[]) {
    let relation = eRel.FarRel;
    undecidedConns.push({
      Target: this._personConn!.Flat!,
      Related: this._relatedConn!.Flat!,
      FarRelDebug: this.farRelStr(relation),
      Options: [relation]
    });
    return relation;
  }
  private farRelStr(relation: eRel) {
    return `${this._personConn!.TargetPerson!.FullName}'s ${this._personConn!.Relationship!.Type}, ${this._personConn!.RelatedPerson!.FullName},` +
      `Has a ${this._relatedConn!.Relationship!.Type}, ` +
      `"So ${this._relatedConn!.RelatedPerson!.FullName} is ${this._personConn!.TargetPerson!.FullName}'s ${relation}`;
  }
  private undecidedRelation(rel1: { Female: eRel, Male: eRel }, rel2: { Female: eRel, Male: eRel }, undecidedConns: IUndecidedConnection[]) {
    var relation1 = this._relatedConn!.RelatedPerson!.Gender == eGender.Female ? rel1.Female : rel1.Male;
    var relation2 = this._relatedConn!.RelatedPerson!.Gender == eGender.Female ? rel2.Female : rel2.Male;
    //var farRelStr1 = this.farRelStr(relation1);
    //var farRelStr2 = this.farRelStr(relation2);

    var to = `${this._relatedConn!.RelatedPerson!.FullName} to ${this._personConn!.TargetPerson!.FullName}`;
    undecidedConns.push({
      Target: this._personConn!.Flat!,
      Related: this._relatedConn!.Flat!,
      FarRelDebug: `${to}, ${relation1}\n${relation2}`,
      Options: [relation1, relation2]
    });
    return eRel.Undecided;
  }

  // relation Checkers
  private checkParent(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {
    let relation: eRel | null = null;

    //person's Parent
    if (this.hasParent(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //isGrandParent
        relation = this.isGrandParent();
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsSibling
        relation = this.isSibling();
      }
      //HasSibling //HasSiblingInLaw
      else if (this.hasSibling(this._relatedConn!) || this.hasSiblingInLaw(this._relatedConn!)) {
        //IsParentSibling
        relation = this.isParentSibling();
      }
      //HasSpouse
      else if (this.hasSpouse(this._relatedConn!)) {
        //IsParent
        relation = this.isParent();
        //IsStepParent
        possibleComplexRel.val = this.isStepParent();
      }
      else {
        //FarRelation
        relation = this.farRelation(undecidedConns);
      }
    }

    return relation;
  }
  private checkChild(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {
    let relation: eRel | null = null;

    //person's Child
    if (this.hasChild(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //IsSpouse
        relation = this.isSpouse();
        //IsExPartner
        possibleComplexRel.val = eRel.ExPartner;
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsGrandChild
        relation = eRel.GrandChild;
      }
      //HasSibling
      else if (this.hasSibling(this._relatedConn!)) {
        //IsChild
        relation = this.isChild();
        //IsStepChild
        possibleComplexRel.val = this.isStepChild();
      }
      //HasSpouse
      else if (this.hasSpouse(this._relatedConn!)) {
        //IsChildInLaw
        relation = this.isChildInLaw();
      }
      else {
        //FarRelation
        relation = this.farRelation(undecidedConns);
      }
    }

    return relation;
  }
  private checkSibling(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {
    let relation: eRel | null = null;

    //person's Sibling
    if (this.hasSibling(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //IsParent
        relation = this.isParent();
        //IsStepParent
        possibleComplexRel.val = this.isStepParent();
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsSiblingChild
        relation = this.isSiblingChild();
      }
      //HasSibling
      else if (this.hasSibling(this._relatedConn!)) {
        //IsSibling
        relation = this.isSibling();
        //IsStepSibling
        possibleComplexRel.val = this.isStepSibling();
      }
      //HasSpouse
      else if (this.hasSpouse(this._relatedConn!)) {
        //IsSiblingInLaw
        relation = this.isSiblingInLaw();
      }
      //HasParentSibling
      else if (this.hasParentSibling(this._relatedConn!)) {
        //IsParentSibling
        relation = this.isParentSibling();
      }
      //HasSiblingInLaw
      else if (this.hasSiblingInLaw(this._relatedConn!)) {
        //IsSiblingInLaw
        relation = this.isSiblingInLaw();
      }
      //HasSiblingChild
      else if (this.hasSiblingChild(this._relatedConn!)) {
        //IsSiblingChild
        relation = this.isSiblingChild();
      }
      else {
        //FarRelation
        relation = this.farRelation(undecidedConns!);
      }
    }

    return relation;
  }
  private checkSpouse(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {
    let relation: eRel | null = null;

    //person's Spouse
    if (this.hasSpouse(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //IsParentInLaw
        relation = this.isParentInLaw();
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsChild
        relation = this.isChild();
        //IsStepChild
        possibleComplexRel.val = this.isStepChild();
      }
      //HasSibling
      //HasSiblingInLaw
      else if (
        this.hasSibling(this._relatedConn!) ||
        this.hasSiblingInLaw(this._relatedConn!)) {
        //IsSiblingInLaw
        relation = this.isSiblingInLaw();
      }
      else {
        //FarRelation
        relation = this.farRelation(undecidedConns);
      }
    }

    return relation;
  }
  private checkSiblingChild(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {
    let relation: eRel | null = null;

    //person's SiblingChild
    if (this.hasSiblingChild(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //IsSiblingInLaw
        relation = this.isSiblingInLaw();
      }

      //IsParentSibling
      //relation = this.isParentSibling();
    }

    return relation;
  }
  private checkParentSibling(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {
    let relation: eRel | null = null;

    //person's ParentSibling
    if (this.hasParentSibling(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //IsGrandParent
        relation = this.isGrandParent();
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsCousin
        relation = eRel.Cousin;
      }
      //HasSibling
      else if (this.hasSibling(this._relatedConn!)) {
        //IsParent
        relation = this.isParent();
      }
      //HasSiblingChild
      else if (this.hasSiblingChild(this._relatedConn!)) {
        //IsSiblingChild
        relation = this.isSiblingChild();
      }
      //HasSpouse
      else if (this.hasSpouse(this._relatedConn!)) {
        //IsParentSibling
        relation = this.isParentSibling();
      }
      //HasSiblingInLaw
      else if (this.hasSiblingInLaw(this._relatedConn!)) {
        //ParentSibling OR Parent -> Undecided
        relation = this.undecidedRelation({ Female: eRel.Aunt, Male: eRel.Uncle }, { Female: eRel.Mother, Male: eRel.Father }, undecidedConns);
      }
      else {
        //FarRelation
        relation = this.farRelation(undecidedConns);
      }
    }

    return relation;
  }
  private checkSiblingInLaw(
    possibleComplexRel: { val: eRel | null },
    undecidedConns: IUndecidedConnection[]) {
    let relation: eRel | null = null;

    //FarRelation
    relation = this.farRelation(undecidedConns);

    //person's SiblingInLaw
    if (this.hasSiblingInLaw(this._personConn!)) {
      //HasParentSibling
      if (this.hasParentSibling(this._relatedConn!)) {
        //IsParentSibling
        relation = this.isParentSibling();
      }
      //HasSpouse
      else if (this.hasSpouse(this._relatedConn!)) {
        //IsSiblingInLaw
        relation = this.isSiblingInLaw();
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsParentSibling
        relation = this.isSiblingChild();
      }
    }

    return relation;
  }

  // has Methods
  private hasSpouse(conn: IConnection) {
    return conn.Relationship!.Type == eRel[eRel.Wife] || conn.Relationship!.Type == eRel[eRel.Husband];
  }
  private hasChild(conn: IConnection) {
    return conn.Relationship!.Type == eRel[eRel.Daughter] || conn.Relationship!.Type == eRel[eRel.Son];
  }
  private hasParent(conn: IConnection) {
    return conn.Relationship!.Type == eRel[eRel.Mother] || conn.Relationship!.Type == eRel[eRel.Father];
  }
  private hasSibling(conn: IConnection) {
    return conn.Relationship!.Type == eRel[eRel.Sister] || conn.Relationship!.Type == eRel[eRel.Brother];
  }
  private hasSiblingChild(conn: IConnection) {
    return conn.Relationship!.Type == eRel[eRel.Niece] || conn.Relationship!.Type == eRel[eRel.Nephew];
  }
  private hasSiblingInLaw(conn: IConnection) {
    return conn.Relationship!.Type == eRel[eRel.SisterInLaw] || conn.Relationship!.Type == eRel[eRel.BrotherInLaw];
  }
  private hasParentSibling(conn: IConnection) {
    return conn.Relationship!.Type == eRel[eRel.Aunt] || conn.Relationship!.Type == eRel[eRel.Uncle];
  }

  // is methods
  private isFemale() {
    return this._relatedConn!.RelatedPerson!.Gender == eGender.Female;
  }

  private isGrandParent() {
    return this.isFemale() ? eRel.GrandMother : eRel.GrandFather;
  }
  private isSibling() {
    return this.isFemale() ? eRel.Sister : eRel.Brother;
  }
  private isParentSibling() {
    return this.isFemale() ? eRel.Aunt : eRel.Uncle;
  }
  private isParent() {
    return this.isFemale() ? eRel.Mother : eRel.Father;
  }
  private isStepParent() {
    return this.isFemale() ? eRel.StepMother : eRel.StepFather;
  }
  private isSiblingChild() {
    return this.isFemale() ? eRel.Niece : eRel.Nephew;
  }
  private isSiblingInLaw() {
    return this.isFemale() ? eRel.SisterInLaw : eRel.BrotherInLaw;
  }
  private isChild() {
    return this.isFemale() ? eRel.Daughter : eRel.Son;
  }
  private isStepChild() {
    return this.isFemale() ? eRel.StepDaughter : eRel.StepSon;
  }
  private isParentInLaw() {
    return this.isFemale() ? eRel.MotherInLaw : eRel.FatherInLaw;
  }
  private isStepSibling() {
    return this.isFemale() ? eRel.StepSister : eRel.StepBrother;
  }
  private isChildInLaw() {
    return this.isFemale() ? eRel.DaughterInLaw : eRel.SonInLaw;
  }
  private isSpouse() {
    return this.isFemale() ? eRel.Wife : eRel.Husband;
  }
}
