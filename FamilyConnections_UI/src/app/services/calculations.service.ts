import { Injectable } from '@angular/core';
import { eGender, eRel, IConnection, IFlatConnection, IPerson } from '../persons/person.model';
import { INameToId } from '../shared/common.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {
  private _personConn: IConnection | null = null;
  private _relatedConn: IConnection | null = null;
  private _conns: IConnection[] = [];
  private _newConns: IConnection[] = [];
  private _undecidedConns: IConnection[] = [];

  constructor() { }

  // operation Methods
  initCalculation(personConn: IConnection, relatedConn: IConnection, conns: IConnection[], newConns: IConnection[], unDecs: IConnection[]) {
    this._personConn = personConn;
    this._relatedConn = relatedConn;
    this._conns = conns;
    this._newConns = newConns;
    this._undecidedConns = unDecs;
  }
  getConns() {
    return this._conns;
  }
  findRelation(): eRel | null {
    let relation: eRel | null = this.checkParent();
    if (!relation) relation = this.checkChild();
    if (!relation) relation = this.checkSibling();
    if (!relation) relation = this.checkSpouse();
    if (!relation) relation = this.checkParentSibling();
    if (!relation) relation = this.checkSiblingChild();
    if (!relation) relation = this.checkSiblingInLaw();
    if (!relation) relation = this.farRelation();

    let relName = eRel[relation];
    return relation;
  }
  connectBetween(
    person: IPerson, relatedPerson: IPerson | null, relation: eRel | null, opposite: boolean = false,
    createConnection: (person: IPerson, related: IPerson, relation: eRel) => IConnection | null) {

    if (opposite) {
      relation = this.opposite(relation!, relatedPerson!.Gender);
    }

    if (!this.anyConnExists(person, relatedPerson!)) {
      let newConn: IConnection = createConnection(person, relatedPerson!, relation!)!;
      this._newConns.push(newConn);
      this._conns.push(newConn);

      let existsInFlat = person.FlatConnections.some(f => f.TargetId == person.Id && f.RelatedId == relatedPerson?.Id);
      if (!existsInFlat) person.FlatConnections.push(newConn.Flat!);
    }

    if (!opposite) {
      this.connectBetween(relatedPerson!, person, relation, opposite = true, createConnection);
    }
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
      case eRel.Undecided:
        oppositeRel = eRel.Undecided;
        break;
    }

    return oppositeRel;
  }

  private newConnExists(person: IPerson, related: IPerson) {
    return this._newConns.some(c =>
      c.TargetPerson?.Id == person.Id && c.RelatedPerson?.Id == related.Id ||
      c.RelatedPerson?.Id == person.Id && c.TargetPerson?.Id == related.Id);
  }
  private anyConnExists(person: IPerson, related: IPerson) {
    let existsInNew = this.newConnExists(person, related); 
    let existsInAll = this.connExists(person, related);
    return existsInNew || existsInAll;
  }
  connExists(person: IPerson, related: IPerson) {
    return this._conns.some(c => c.TargetPerson?.Id == person.Id && c.RelatedPerson?.Id == related.Id);
  }

  private createConnection(relation: eRel, options: INameToId[] = []) {
    let conn = null;
    let exists = this._undecidedConns.some(c =>
      c.TargetPerson!.Id == this._personConn?.TargetPerson!.Id &&
      c.RelatedPerson!.Id == this._relatedConn!.RelatedPerson!.Id);
    if (!exists) {
      conn = {
        TargetPerson: this._personConn?.TargetPerson!,
        RelatedPerson: this._relatedConn!.RelatedPerson,
        Flat: {
          TargetId: this._personConn?.TargetPerson!.Id as number,
          RelatedId: this._relatedConn?.RelatedPerson!.Id as number,
          RelationshipId: relation
        },
        Relationship: {
          Id: relation,
          Type: eRel[relation]
        },
        Confirmed: false,
        RelationStr: this.relationStr(relation),
        UndecidedOptions: options,
        SelectedUndecided: { Id: -1, Name: '' }
      };
    }
    return conn;
  }
  private farRelation() {
    let relation = eRel.FarRel;
    let newUndec = this.createConnection(relation); //the creation process checks the existence of the proposed conn to be created.
    if (newUndec != null) this.pushToUndecided(newUndec);
    return relation;
  }

  private relationStr(relation: eRel) {
    if (this._personConn == null || this._relatedConn == null) return '';

    return `${this._personConn!.TargetPerson!.FullName}'s ${this._personConn!.Relationship!.Type}, ${this._personConn!.RelatedPerson!.FullName}, ` +
      `Has a ${this._relatedConn!.Relationship!.Type}, ` +
      `So ${this._relatedConn!.RelatedPerson!.FullName} is ${this._personConn!.TargetPerson!.FullName}'s ${eRel[relation]}`;
  }
  private undecidedRelation(relation1: eRel, relation2: eRel) {
    let undecidedConn = this.createConnection(eRel.Undecided, [{ Id: relation1, Name: eRel[relation1] }, { Id: relation2, Name: eRel[relation2] }]);
    if (undecidedConn != null) this.pushToUndecided(undecidedConn);
    return eRel.Undecided;
  }
  private pushToUndecided(undecidedConn: IConnection) {

    if (!this.newConnExists(undecidedConn.TargetPerson!, undecidedConn.RelatedPerson!))
    this._undecidedConns.push(undecidedConn);
  }

  // relation Checkers
  private checkParent() {
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
        //Parent OR StepParent -> Undecided
        let relation1 = this.isParent();
        let relation2 = this.isStepParent();
        relation = this.undecidedRelation(relation1, relation2);
      }
    }

    return relation;
  }
  private checkChild() {
    let relation: eRel | null = null;

    //person's Child
    if (this.hasChild(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //Spouse OR ExPartner -> Undecided
        let relation1 = this.isSpouse();
        let relation2 = eRel.ExPartner;
        relation = this.undecidedRelation(relation1, relation2);
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsGrandChild
        relation = eRel.GrandChild;
      }
      //HasSibling
      else if (this.hasSibling(this._relatedConn!)) {
        //Child OR StepChild -> Undecided
        let relation1 = this.isChild();
        let relation2 = this.isStepChild();
        relation = this.undecidedRelation(relation1, relation2);
      }
      //HasSpouse
      else if (this.hasSpouse(this._relatedConn!)) {
        //IsChildInLaw
        relation = this.isChildInLaw();
      }
    }

    return relation;
  }
  private checkSibling() {
    let relation: eRel | null = null;

    //person's Sibling
    if (this.hasSibling(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //Parent OR StepParent -> Undecided
        let relation1 = this.isParent();
        let relation2 = this.isStepParent();
        relation = this.undecidedRelation(relation1, relation2);
      }
      //HasChild
      else if (this.hasChild(this._relatedConn!)) {
        //IsSiblingChild
        relation = this.isSiblingChild();
      }
      //HasSibling
      else if (this.hasSibling(this._relatedConn!)) {
        //Sibling OR StepSibling -> Undecided
        let relation1 = this.isSibling();
        let relation2 = this.isStepSibling();
        relation = this.undecidedRelation(relation1, relation2);
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
    }

    return relation;
  }
  private checkSpouse() {
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
        //Child OR StepChild -> Undecided
        let relation1 = this.isChild();
        let relation2 = this.isStepChild();
        relation = this.undecidedRelation(relation1, relation2);
      }
      //HasSibling
      //HasSiblingInLaw
      else if (
        this.hasSibling(this._relatedConn!) ||
        this.hasSiblingInLaw(this._relatedConn!)) {
        //IsSiblingInLaw
        relation = this.isSiblingInLaw();
      }
    }

    return relation;
  }
  private checkSiblingChild() {
    let relation: eRel | null = null;

    //person's SiblingChild
    if (this.hasSiblingChild(this._personConn!)) {
      //HasParent
      if (this.hasParent(this._relatedConn!)) {
        //IsSiblingInLaw
        relation = this.isSiblingInLaw();
      }
    }

    return relation;
  }
  private checkParentSibling() {
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
        let relation1 = this.isParentSibling();
        let relation2 = this.isParent();
        relation = this.undecidedRelation(relation1, relation2);
      }
    }

    return relation;
  }
  private checkSiblingInLaw() {
    let relation: eRel | null = null;

    //FarRelation
    relation = this.farRelation();

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
