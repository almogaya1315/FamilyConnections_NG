import { Injectable } from '@angular/core';
import { eGender, eRel, IConnection, IFlatConnection, IPerson, IRelationshipInfo, IUndecidedConnection } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';
import { CacheService, eStorageKeys, eStorageType } from './cache.service';
import { CalculationsService } from './calculations.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsService {

  constructor(
    private personsRepo: PersonsRepositoryService,
    private calcSvc: CalculationsService,
    private cacheSvc: CacheService) { }

  createConnection(person: IPerson, relatedPerson: IPerson, relation: eRel, possibleComplex: eRel | null = null): IConnection | null {
    let newRel = ConnectionsService.newRelationship(relation as number);
    let conn = {
      TargetPerson: person,
      RelatedPerson: relatedPerson,
      Relationship: newRel,
      Flat: {
        TargetId: person.Id as number,
        RelatedId: relatedPerson?.Id as number,
        RelationshipId: relation as number
      }
    }
    return conn;
  }

  private fillPerson(person: IPerson, persons: IPerson[], inputs: Inputs | null = null) {
    if (inputs != null) {
      person!.Id = Math.max(...persons!.map(p => p.Id as number)) + 1;;
      person!.FullName = inputs.targetPersonFullName;
      person!.DateOfBirth = inputs.targetPersonDataOfBirth;
      person!.PlaceOfBirth = inputs.selectedPlaceOfBirthName;
      person!.Gender = inputs.selectedGenderId;
    }
    else {
      person = persons.find(p => p.Id == person.Id)!;
    }
  }
  fillNewConnection(newConnection: IConnection, persons: IPerson[], inputs: Inputs): IConnection {

    newConnection!.TargetPerson!.Id = Math.max(...persons!.map(p => p.Id as number)) + 1;;
    newConnection!.TargetPerson!.FullName = inputs.targetPersonFullName;
    newConnection!.TargetPerson!.DateOfBirth = inputs.targetPersonDataOfBirth;
    newConnection!.TargetPerson!.PlaceOfBirth = inputs.selectedPlaceOfBirthName;
    newConnection!.TargetPerson!.Gender = inputs.selectedGenderId;
    newConnection!.RelatedPerson!.Id = inputs.selectedRelatedId;
    newConnection!.Relationship!.Id = inputs.selectedRelationId;
    newConnection!.Relationship!.Type = eRel[inputs.selectedRelationId];

    var flatCon: IFlatConnection = {
      TargetId: newConnection!.TargetPerson!.Id as number,
      RelatedId: newConnection!.RelatedPerson!.Id as number,
      RelationshipId: newConnection!.Relationship!.Id
    };

    newConnection!.Flat = flatCon;

    newConnection!.TargetPerson!.FlatConnections.push(flatCon);

    return newConnection;
  }

  calcConnections(newConnection: IConnection, persons: IPerson[]): IConnection[] {
    persons!.push(newConnection!.TargetPerson!)
    var newConnections = this.checkAllConnections(persons!);
    newConnection.RelatedPerson = persons.find(p => p.Id == newConnection.RelatedPerson!.Id)!;
    var oppositeCon = this.opposite(newConnection);
    newConnections.push(newConnection, oppositeCon);
    return newConnections;
  }

  setLocalCache(persons: IPerson[], newConnections: IConnection[]) {
    this.cacheSvc.setCache(persons, eStorageKeys.AllLocalPersons, [eStorageType.Session]);
    let conns = this.calcSvc.getConns();
    newConnections.forEach(c => conns.push(c));
    this.cacheSvc.setCache(conns, eStorageKeys.AllLocalConnections, [eStorageType.Session]);
  }

  private opposite(con: IConnection): IConnection {
    let oppositeRel = this.calcSvc.opposite(con.Relationship!.Id as eRel, con.RelatedPerson?.Gender!);
    return this.createConnection(con.RelatedPerson!, con.TargetPerson!, oppositeRel)!;
  }

  private checkAllConnections(persons: IPerson[]): IConnection[] {
    let newConns: IConnection[] = [];

    let possibleComplex: IConnection[] = [];
    let undecidedConns: IUndecidedConnection[] = [];

    let flatConns: IFlatConnection[] = this.cacheSvc.getCache(eStorageKeys.AllLocalConnections, eStorageType.Session)!;
    let conns = this.mapFlatConnections(flatConns, persons);


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
          this.calcSvc.initCalculation(personConn!, relatedConn, conns);
          if (!this.calcSvc.anyConExists(person, relatedConn.TargetPerson!)) {
            //ComplexRel -> Step, InLaw, Great, Ex, Far
            let possibleComplexRel: { val: eRel | null } = { val: null };
            relation = this.calcSvc.findRelation(possibleComplexRel!, undecidedConns);
            this.calcSvc.connectBetween(person, relatedConn.RelatedPerson, relation, newConns!, possibleComplexRel!, possibleComplex, false, this.createConnection);
          }
        });

      } catch (e) {
        let error = e;
      }
    });

    //return newConns.map(c => c.Flat!);
    return newConns;
  }

  private mapFlatConnections(flatConns: IFlatConnection[], persons: IPerson[]): IConnection[] {
    let flatMap = flatConns.map(f => ({
      TargetPerson: persons.find(p => p.Id == f.TargetId)!,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId)!,
      Relationship: ConnectionsService.newRelationship(f.RelationshipId),
      Flat: f
    }));
    return flatMap;
  }

  private mapPersonFlatConnections(person: IPerson, persons: IPerson[]): IConnection[] {
    return person.FlatConnections.map(f => ({
      TargetPerson: person,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId) ?? null,
      Relationship: ConnectionsService.newRelationship(f.RelationshipId),
      Flat: f
    }));
  }

  newRelationship(relationshipId: number, possibleComplexRel: eRel | null = null): IRelationshipInfo | null {
    return ConnectionsService.newRelationship(relationshipId, possibleComplexRel);
  }

  private static newRelationship(relationshipId: number, possibleComplexRel: eRel | null = null): IRelationshipInfo | null {
    let rel = {
      Id: relationshipId ?? -1,
      Type: eRel[relationshipId],
      PossibleComplexRel: possibleComplexRel
    }
    return rel;
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
