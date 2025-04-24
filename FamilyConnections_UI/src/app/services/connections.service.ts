import { Injectable } from '@angular/core';
import { eGender, eRel, IConnection, IFlatConnection, IPerson, IUndecidedConnection } from '../persons/person.model';
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
    return {
      TargetPerson: person,
      RelatedPerson: relatedPerson,
      Relationship: {
        Id: relation as number,
        Type: relation!,
        PossibleComplexRel: possibleComplex
      },
      Flat: {
        TartgetId: person.Id as number,
        RelatedId: relatedPerson?.Id as number,
        RelationshipId: relation as number
      }
    }
  }

  fillNewConnection(persons: IPerson[], inputs: Inputs): IConnection {

    let newConnection = this.createConnection(
      this.personsRepo.getDefaultPerson(),
      this.personsRepo.getDefaultPerson(),
      eRel.Undecided
    );

    newConnection!.TargetPerson!.Id = Math.max(...persons!.map(p => p.Id as number)) + 1;;
    newConnection!.TargetPerson!.FullName = inputs.targetPersonFullName;
    newConnection!.TargetPerson!.DateOfBirth = inputs.targetPersonDataOfBirth;
    newConnection!.TargetPerson!.PlaceOfBirth = inputs.selectedPlaceOfBirthName;
    newConnection!.TargetPerson!.Gender = inputs.selectedGenderId;
    newConnection!.RelatedPerson!.Id = inputs.selectedRelatedId;
    newConnection!.Relationship!.Id = inputs.selectedRelationId;

    var flatCon: IFlatConnection = {
      TartgetId: newConnection!.TargetPerson!.Id as number,
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
    //let oppositeRel = eRel.FarRel;
    //let relation = flatCon.RelationshipId as eRel;
    //let gender = relatedPerson.Gender;

    //switch (relation) {
    //  case eRel.Mother:
    //  case eRel.Father:
    //    oppositeRel = gender == eGender.Female ? eRel.Daughter : eRel.Son;
    //    break;
    //  case eRel.Sister:
    //  case eRel.Brother:
    //    oppositeRel = gender == eGender.Female ? eRel.Sister : eRel.Brother;
    //    break;
    //  case eRel.Daughter:
    //  case eRel.Son:
    //    oppositeRel = gender == eGender.Female ? eRel.Mother : eRel.Father;
    //    break;
    //  case eRel.Wife:
    //    oppositeRel = eRel.Husband;
    //    break;
    //  case eRel.Husband:
    //    oppositeRel = eRel.Wife;
    //    break;
    //  case eRel.Aunt:
    //  case eRel.Uncle:
    //    oppositeRel = gender == eGender.Female ? eRel.Niece : eRel.Nephew;
    //    break;
    //  case eRel.Cousin:
    //    oppositeRel = eRel.Cousin;
    //    break;
    //  case eRel.Niece:
    //  case eRel.Nephew:
    //    oppositeRel = gender == eGender.Female ? eRel.Aunt : eRel.Uncle;
    //    break;
    //  case eRel.GrandMother:
    //  case eRel.GrandFather:
    //    oppositeRel = eRel.GrandChild;
    //    break;
    //  case eRel.GrandChild:
    //    oppositeRel = gender == eGender.Female ? eRel.GrandMother : eRel.GrandFather;
    //    break;
    //  case eRel.MotherInLaw:
    //  case eRel.FatherInLaw:
    //    oppositeRel = gender == eGender.Female ? eRel.DaughterInLaw : eRel.SonInLaw;
    //    break;
    //  case eRel.SisterInLaw:
    //  case eRel.BrotherInLaw:
    //    oppositeRel = gender == eGender.Female ? eRel.SisterInLaw : eRel.BrotherInLaw;
    //    break;
    //  case eRel.DaughterInLaw:
    //  case eRel.SonInLaw:
    //    oppositeRel = gender == eGender.Female ? eRel.MotherInLaw : eRel.FatherInLaw;
    //    break;
    //  case eRel.StepMother:
    //  case eRel.StepFather:
    //    oppositeRel = gender == eGender.Female ? eRel.StepDaughter : eRel.StepSon;
    //    break;
    //  case eRel.StepSister:
    //  case eRel.StepBrother:
    //    oppositeRel = gender == eGender.Female ? eRel.StepSister : eRel.StepBrother;
    //    break;
    //  case eRel.StepDaughter:
    //  case eRel.StepSon:
    //    oppositeRel = gender == eGender.Female ? eRel.StepMother : eRel.StepFather;
    //    break;
    //  case eRel.ExPartner:
    //    oppositeRel = eRel.ExPartner;
    //    break;
    //  case eRel.GreatGrandMother:
    //  case eRel.GreatGrandFather:
    //    oppositeRel = gender == eGender.Female ? eRel.GreatGrandDaughter : eRel.GreatGrandSon;
    //    break;
    //  case eRel.GreatGrandDaughter:
    //  case eRel.GreatGrandSon:
    //    oppositeRel = gender == eGender.Female ? eRel.GreatGrandMother : eRel.GreatGrandFather;
    //    break;
    //  case eRel.FarRel:
    //    oppositeRel = eRel.FarRel;
    //    break;
    //}

    let oppositeRel = this.calcSvc.opposite(flatCon.RelationshipId as eRel, relatedPerson.Gender);

    return {
      TartgetId: flatCon.RelatedId,
      RelatedId: flatCon.TartgetId,
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

          this.calcSvc.connectBetween(person, relatedConn.RelatedPerson, relation, newConns!, possibleComplexRel!, possibleComplex);
        });

      } catch (e) {
        let error = e;
      }
    });

    return newConns;
  }

  private mapFlatConnections(flatConns: IFlatConnection[], persons: IPerson[]): IConnection[] {
    return flatConns.map(f => ({
      TargetPerson: persons.find(p => p.Id == f.TartgetId)!,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId)!,
      Relationship: {
        Id: f.RelationshipId,
        Type: f.RelationshipId as eRel
      },
      Flat: f
    }));
  }

  private mapPersonFlatConnections(person: IPerson, persons: IPerson[]): IConnection[] {
    return person.FlatConnections.map(f => ({
      TargetPerson: person,
      RelatedPerson: persons.find(p => p.Id == f.RelatedId) ?? null,
      Relationship: {
        Id: f.RelationshipId,
        Type: f.RelationshipId as eRel
      },
      Flat: f
    }));
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
