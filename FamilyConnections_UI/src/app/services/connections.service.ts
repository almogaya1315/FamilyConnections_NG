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

  createConnection(person: IPerson, relatedPerson: IPerson, relation: eRel, possibleComplex: eRel | null = null): IConnection {
    let conn = {
      TargetPerson: person,
      RelatedPerson: relatedPerson,
      Relationship: this.newRelationship(relation as number),
      Flat: {
        TargetId: person.Id as number,
        RelatedId: relatedPerson?.Id as number,
        RelationshipId: relation as number
      }
    }
    return conn;
  }

  fillNewConnection(newConnection: IConnection, persons: IPerson[], inputs: Inputs): IConnection {

    newConnection!.TargetPerson!.Id = Math.max(...persons!.map(p => p.Id as number)) + 1;;
    newConnection!.TargetPerson!.FullName = inputs.targetPersonFullName;
    newConnection!.TargetPerson!.DateOfBirth = inputs.targetPersonDataOfBirth;
    newConnection!.TargetPerson!.PlaceOfBirth = inputs.selectedPlaceOfBirthName;
    newConnection!.TargetPerson!.Gender = inputs.selectedGenderId;
    newConnection!.RelatedPerson!.Id = inputs.selectedRelatedId;
    newConnection!.Relationship!.Id = inputs.selectedRelationId;

    var flatCon: IFlatConnection = {
      TargetId: newConnection!.TargetPerson!.Id as number,
      RelatedId: newConnection!.RelatedPerson!.Id as number,
      RelationshipId: newConnection!.Relationship!.Id
    };

    newConnection!.Flat = flatCon;

    newConnection!.TargetPerson!.FlatConnections.push(flatCon);

    return newConnection;
  }

  calcConnections(newConnection: IConnection, persons: IPerson[]): IFlatConnection[] {
    persons!.push(newConnection!.TargetPerson!)
    var newConnections = this.checkAllConnections(persons!);
    let flatCon = newConnection!.Flat!;
    var relatedPerson = persons?.find(p => p.Id == flatCon.RelatedId);
    var oppositeFlatCon = this.opposite(flatCon, relatedPerson!);
    newConnections.push(flatCon, oppositeFlatCon);
    return newConnections;
  }

  setLocalCache(persons: IPerson[], newConnection: IConnection) {
    persons?.push(newConnection.TargetPerson!);
    this.cacheSvc.setCache(persons, eStorageKeys.AllLocalPersons, [eStorageType.Session]);
    let conns = this.calcSvc.getConns();
    conns.push(newConnection);
    this.cacheSvc.setCache(conns, eStorageKeys.AllLocalConnections, [eStorageType.Session]);
  }

  private opposite(flatCon: IFlatConnection, relatedPerson: IPerson): IFlatConnection {
    let oppositeRel = this.calcSvc.opposite(flatCon.RelationshipId as eRel, relatedPerson.Gender);

    return {
      TargetId: flatCon.RelatedId,
      RelatedId: flatCon.TargetId,
      RelationshipId: oppositeRel as number
    };
  }

  private checkAllConnections(persons: IPerson[]): IFlatConnection[] {
    let newConns: IConnection[] = [];

    let possibleComplex: IConnection[] = [];
    let undecidedConns: IUndecidedConnection[] = [];

    // reverse to start with the new added person
    persons.reverse();
    persons.forEach(person => {
      try {
        debugger;

        let personConns: IConnection[] = this.mapPersonFlatConnections(person, persons);

        debugger;

        let relatedConns: IConnection[] = personConns
          .filter(c => c.RelatedPerson!.Id != person.Id)
          .flatMap(c => this.mapPersonFlatConnections(c.RelatedPerson!, persons)
          );

        debugger;

        relatedConns.forEach(relatedConn => {
          let relation: eRel | null;
          let personConn = personConns.find(pc => pc.RelatedPerson!.Id == relatedConn.TargetPerson!.Id);

          //ComplexRel -> Step, InLaw, Great, Ex, Far
          let possibleComplexRel: { val: eRel | null };

          let flatConns: IFlatConnection[] = this.cacheSvc.getCache(eStorageKeys.AllLocalConnections, eStorageType.Session)!;
          let conns = this.mapFlatConnections(flatConns, persons);
          this.calcSvc.initCalculation(personConn!, relatedConn, conns);
          relation = this.calcSvc.findRelation(possibleComplexRel!, undecidedConns);

          debugger;

          this.calcSvc.connectBetween(person, relatedConn.RelatedPerson, relation, newConns!, possibleComplexRel!, possibleComplex, false, this.createConnection);
        });

      } catch (e) {
        let error = e;
      }
    });

    return newConns.map(c => c.Flat!);
  }

  private mapFlatConnections(flatConns: IFlatConnection[], persons: IPerson[]): IConnection[] {
    return flatConns.map(f => ({
      TargetPerson: persons.find(p => p.Id == f.TargetId)!,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId)!,
      Relationship: this.newRelationship(f.RelationshipId),
      Flat: f
    }));
  }

  private mapPersonFlatConnections(person: IPerson, persons: IPerson[]): IConnection[] {
    return person.FlatConnections.map(f => ({
      TargetPerson: person,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId) ?? null,
      Relationship: this.newRelationship(f.RelationshipId),
      Flat: f
    }));
  }

  newRelationship(relationshipId: number, possibleComplexRel: eRel | null = null): IRelationshipInfo {
    return {
      Id: relationshipId ?? -1,
      Type: eRel[relationshipId],
      PossibleComplexRel: possibleComplexRel
    }
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
