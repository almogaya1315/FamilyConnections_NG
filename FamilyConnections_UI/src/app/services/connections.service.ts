import { Injectable } from '@angular/core';
import { eGender, eRel, IConnection, IConnectionSummary, IFlatConnection, IPerson, IRelationshipInfo } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';
import { INameToId } from '../shared/common.model';
import { CacheService, eStorageKeys, eStorageType } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsService {
  private _personConn: IConnection | null = null;
  private _relatedConn: IConnection | null = null;
  private _conns: IConnection[] = [];
  private _newConns: IConnection[] = [];
  private _undecidedConns: IConnection[] = [];

  constructor(
    private personsRepo: PersonsRepositoryService,
    private cacheSvc: CacheService) { }

  //operation methods
  calcConnections(newConnection: IConnection, persons: IPerson[], inputs: Inputs, undecidedConns: IConnection[]): IConnection[] {
    newConnection = this.fillNewConnection(newConnection!, persons!, inputs);
    var newConnections = this.checkAllConnections(newConnection, persons!, undecidedConns);
    return newConnections;
  }
  private fillNewConnection(newConnection: IConnection, persons: IPerson[], inputs: Inputs): IConnection {
    newConnection!.TargetPerson!.Id = Math.max(...persons!.map(p => p.Id as number)) + 1;;
    newConnection!.TargetPerson!.FullName = inputs.targetPersonFullName;
    newConnection!.TargetPerson!.DateOfBirth = inputs.targetPersonDataOfBirth;
    newConnection!.TargetPerson!.PlaceOfBirth = inputs.selectedPlaceOfBirthName;
    newConnection!.TargetPerson!.Gender = inputs.selectedGenderId;
    newConnection!.RelatedPerson!.Id = inputs.selectedRelatedId;
    newConnection!.Relationship!.Id = inputs.selectedRelationId;
    newConnection!.Relationship!.Type = eRel[inputs.selectedRelationId];

    newConnection.RelatedPerson = persons.find(p => p.Id == newConnection.RelatedPerson!.Id)!;
    newConnection = this.createConnection(newConnection!.TargetPerson!, newConnection!.RelatedPerson!, newConnection!.Relationship!.Id)!;
    persons!.push(newConnection!.TargetPerson!)
    return newConnection;
  }
  private checkAllConnections(newConn: IConnection, persons: IPerson[], undecidedConns: IConnection[]): IConnection[] {
    this.pushOpposites(newConn);

    // reverse to start with the new added person
    persons.reverse();
    persons.forEach(person => {
      try {
        let personConns: IConnection[] = this.mapPersonFlatConnections(person, persons);
        let relatedConns: IConnection[] = personConns
          .flatMap(c => this.mapPersonFlatConnections(c.RelatedPerson!, persons)
            .filter(c => c.RelatedPerson?.Id != person.Id)
            .filter(c => c.RelatedPerson != null)
          );

        relatedConns.forEach(relatedConn => {
          let relation: eRel | null;
          let personConn = personConns.find(pc => pc.RelatedPerson!.Id == relatedConn.TargetPerson!.Id);
          this.initCalculation(personConn!, relatedConn, persons, undecidedConns);
          if (!this.anyConnExists(person, relatedConn.RelatedPerson!)) { //this.anyConnExists - 1st call
            relation = this.findRelation();
            var relName = eRel[relation!];
            //this.anyConnExists - 2nd call, from inside this.connectBetween, because of recursion call for opposite relation
            //when the relation is set to far/undec, in this.findRelation, this._undecidedConns gets filled with a new connection,
            //and this.anyConnExists will prevent this.connectBetween from creating another connection
            this.connectBetween(person, relatedConn.RelatedPerson, relation, false);
          }
        });

      } catch (e) {
        let error = e;
      }
    });

    return this._newConns;
  }

  //opposites
  private pushOpposites(newConn: IConnection) {
    newConn.RelationStr = this.connStr(newConn);
    this._newConns.push(newConn);
    var oppositeCon = this.oppositeConn(newConn);
    oppositeCon.RelationStr = this.connStr(oppositeCon, true);
    this._newConns.push(oppositeCon);
  }
  private connStr(conn: IConnection, opposite: boolean = false): string {
    let str = '';
    if (opposite && conn.TargetPerson?.FullName) {
      str = `You are ${conn.TargetPerson?.FullName}'s' ${eRel[conn.Relationship!.Id!]}'`;
    } else if (conn.RelatedPerson?.FullName) {
      str = `${conn.RelatedPerson?.FullName} is your ${eRel[conn.Relationship!.Id!]}'`;
    }

    return str;
  }
  private oppositeConn(con: IConnection): IConnection {
    let oppositeRel = this.oppositeRelation(con.Relationship!.Id as eRel, con.TargetPerson?.Gender!);
    return this.createConnection(con.RelatedPerson!, con.TargetPerson!, oppositeRel)!;
  }

  //mapping
  private initCalculation(personConn: IConnection, relatedConn: IConnection, persons: IPerson[], unDecs: IConnection[]) {

    let flatConns: IFlatConnection[] = this.cacheSvc.getCache(eStorageKeys.AllLocalConnections, eStorageType.Session)!;

    this._personConn = personConn;
    this._relatedConn = relatedConn;
    this._conns = this.mapFlatConnections(flatConns, persons);;
    this._newConns = this._newConns == null ? [] : this._newConns;
    this._undecidedConns = unDecs;

    this._personConn!.RelationStr += this.connStr(personConn!);
    this._relatedConn!.RelationStr += this.connStr(relatedConn!);
  }
  private mapPersonFlatConnections(person: IPerson, persons: IPerson[]): IConnection[] {
    return person.FlatConnections.map(f => ({
      Id: this.createConnId(f.RelationshipId, person.Id as string, f.RelatedId.toString()),
      TargetPerson: person,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId) ?? null,
      Relationship: this.newRelationship(f.RelationshipId),
      Flat: f,
      Confirmed: false,
      RelationStr: '',
      UndecidedOptions: [],
      SelectedUndecided: null,
      OppositeConnId: null
    }));
  }
  private mapFlatConnections(flatConns: IFlatConnection[], persons: IPerson[]): IConnection[] {
    let flatMap = flatConns.map(f => ({
      Id: this.createConnId(f.RelationshipId),
      TargetPerson: persons.find(p => p.Id == f.TargetId)!,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId)!,
      Relationship: this.newRelationship(f.RelationshipId),
      Flat: f,
      Confirmed: false,
      RelationStr: '',
      UndecidedOptions: [],
      SelectedUndecided: null,
      OppositeConnId: null
    }));
    return flatMap;
  }
  private createConnId(relationId: number, targetId: string = '-1', relatedId: string = '-1'): string {
    if (this._personConn != null && this._relatedConn != null) {
      targetId = `${this._personConn!.TargetPerson!.Id}`;
      relatedId = `${this._relatedConn!.RelatedPerson!.Id}`;
    }
    let id = `${targetId}|${relatedId}|${relationId}`;
    return id;
  }
  newRelationship(relationshipId: number): IRelationshipInfo | null {
    let rel: IRelationshipInfo = {
      Id: relationshipId ?? -1,
      Type: eRel[relationshipId]
    }
    return rel;
  }

  //existance
  private connExists(person: IPerson, related: IPerson) {
    return this._conns.some(c => c.TargetPerson?.Id == person.Id && c.RelatedPerson?.Id == related.Id);
  }
  private newConnExists(person: IPerson, related: IPerson) {
    return this._newConns.some(c =>
      c.TargetPerson?.Id == person.Id && c.RelatedPerson?.Id == related.Id ||
      c.RelatedPerson?.Id == person.Id && c.TargetPerson?.Id == related.Id);
  }
  private undecConnExists(person: IPerson, related: IPerson) {
    return this._undecidedConns.some(c =>
      c.TargetPerson!.Id == person.Id &&
      c.RelatedPerson!.Id == related.Id);
  }
  private anyConnExists(person: IPerson, related: IPerson) {
    let existsInNew = this.newConnExists(person, related);
    let existsInAll = this.connExists(person, related);
    let existsInUndec = this.undecConnExists(person, related);
    return existsInNew || existsInAll || existsInUndec;
  }

  //connecting
  private findRelation(): eRel | null {
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
  private connectBetween(person: IPerson, relatedPerson: IPerson | null, relation: eRel | null, opposite: boolean = false) {

    if (opposite) {
      relation = this.oppositeRelation(relation!, relatedPerson!.Gender);
    }

    if (!this.anyConnExists(person, relatedPerson!)) {
      let newConn: IConnection = this.createConnection(person, relatedPerson!, relation!)!;
      if (newConn == null) return;
      this._newConns.push(newConn);
      this._conns.push(newConn);

      let existsInFlat = person.FlatConnections.some(f => f.TargetId == person.Id && f.RelatedId == relatedPerson?.Id);
      if (!existsInFlat) person.FlatConnections.push(newConn.Flat!);
    }

    if (!opposite) {
      this.connectBetween(relatedPerson!, person, relation, opposite = true);
    }
  }
  createConnection(person: IPerson, relatedPerson: IPerson, relation: eRel, options: INameToId[] = []): IConnection | null {
    let id = this.createConnId(relation, person.Id as string, relatedPerson.Id as string);
    let newRel = this.newRelationship(relation as number);
    let oppConnId = this.calcOppositeConnId(id, person.Gender)!;
    //let relStr = this.relationStr(relation);
    var flatCon: IFlatConnection = {
      TargetId: person.Id as number,
      RelatedId: relatedPerson?.Id as number,
      RelationshipId: relation as number
    };

    let conn = {
      Id: id,
      TargetPerson: person,
      RelatedPerson: relatedPerson,
      Relationship: newRel,
      Flat: flatCon,
      Confirmed: false,
      RelationStr: '', //relStr,
      UndecidedOptions: options,
      SelectedUndecided: { Id: -1, Name: '' },
      OppositeConnId: oppConnId
    }
    conn.RelationStr = this.connStr(conn);
    if (flatCon.TargetId! != -1 && flatCon.RelatedId != -1)
      conn.TargetPerson!.FlatConnections.push(flatCon);
    return conn;
  }
  private relationStr(relation: eRel) {
    if (this._personConn == null || this._relatedConn == null) {
      return '';
    }

    return `${this._personConn!.TargetPerson!.FullName}'s ${this._personConn!.Relationship!.Type}, ${this._personConn!.RelatedPerson!.FullName}, ` +
      `Has a ${this._relatedConn!.Relationship!.Type}, ` +
      `So ${this._relatedConn!.RelatedPerson!.FullName} is ${this._personConn!.TargetPerson!.FullName}'s ${eRel[relation]}`;
  }

  //summary
  summarize(foundConns: IConnection[], undecConns: IConnection[]): IConnectionSummary[] {
    let summs: IConnectionSummary[] = [];
    let allConns: IConnection[] = [];
    foundConns.forEach(c => { allConns.push(c); });
    undecConns.forEach(c => { allConns.push(c); });

    allConns.forEach(conn => {
      let oppConn = allConns.find(c => c.OppositeConnId == conn.Id);
      //let oppConn = allConns.find(c => c.Id == conn.OppositeConnId);
      let desc = this.calcSummaryDescription(conn, oppConn!);
      let summ: IConnectionSummary = { Desc: desc, TargetConnId: conn.Id, OppositeConnId: oppConn?.Id as string };
      if (!this.summaryExists(summs, summ)) summs.push(summ);
    });

    return summs;
  }
  private summaryExists(summs: IConnectionSummary[], summ: IConnectionSummary) {
    return summs.some(s =>
      (s.TargetConnId == summ.TargetConnId && s.OppositeConnId == summ.OppositeConnId) ||
      (s.TargetConnId == summ.OppositeConnId && s.OppositeConnId == summ.TargetConnId));
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

  //are methods
  private areCousins(conn: IConnection, oppConn: IConnection) {
    return conn.Relationship?.Id == eRel.Cousin && oppConn.Relationship?.Id == eRel.Cousin;
  }
  private areFar(conn: IConnection, oppConn: IConnection) {
    return conn.Relationship?.Id == eRel.FarRel && oppConn.Relationship?.Id == eRel.FarRel;
  }

  //calc methods
  oppositeRelation(relation: eRel, gender: eGender): eRel {
    let oppositeRel = eRel.FarRel;

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
  private calcOppositeConnId(connId: string, personGen: eGender) {
    let segments = connId.split('|');
    let targetId = segments[0];
    let relatedId = segments[1];
    let relationId = parseInt(segments[2]);
    let oppRelId = this.oppositeRelation(relationId as eRel, personGen);
    return this.createConnId(oppRelId, relatedId, targetId);
  }
  private calcSummaryDescription(conn: IConnection, oppositeConn: IConnection): string {
    let desc = '';

    let newInitialConn = this._newConns[0];
    let target = conn.TargetPerson?.Id == newInitialConn?.TargetPerson?.Id ? 'You' : conn.TargetPerson?.FullName;

    if (this.areCousins(conn, oppositeConn)) {
      desc = `${target} and ${oppositeConn.TargetPerson?.FullName} are ${eRel[eRel.Cousin]}s`;
    }
    else if (this.areFar(conn, oppositeConn)) {
      desc = `${target} and ${conn.RelatedPerson?.FullName} are too far apart`;
    }

    return desc;
  }

  //far & undec
  private farRelation() {
    let relation = eRel.FarRel;
    let newUndec = this.createConnection(this._personConn?.TargetPerson!, this._relatedConn?.RelatedPerson!, relation);
    this.setSelectedUndecided(newUndec!, relation);
    if (newUndec != null) this.pushToUndecided(newUndec);
    return relation;
  }
  private setSelectedUndecided(conn: IConnection, relation: eRel) {
    let option = { Id: relation, Name: eRel[relation] };
    conn!.UndecidedOptions.push(option);
    conn!.SelectedUndecided = option;
  }
  private undecidedRelation(relation1: eRel, relation2: eRel) {
    let undecidedConn = this.createConnection(
      this._personConn?.TargetPerson!, this._relatedConn?.RelatedPerson!,
      eRel.Undecided, [{ Id: relation1, Name: eRel[relation1] }, { Id: relation2, Name: eRel[relation2] }]);
    if (undecidedConn != null) this.pushToUndecided(undecidedConn);
    return eRel.Undecided;
  }
  private pushToUndecided(undecidedConn: IConnection) {
    if (!this.newConnExists(undecidedConn.TargetPerson!, undecidedConn.RelatedPerson!))
      this._undecidedConns.push(undecidedConn);
  }
}

export interface Inputs {
  selectedPlaceOfBirthName: string,
  selectedGenderId: number,
  selectedRelatedId: number,
  selectedRelationId: number,
  targetPersonFullName: string,
  targetPersonDataOfBirth: Date
}
