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

  fillNewConnection(persons: IPerson[], inputs: Inputs): IConnection {

    let newConnection: IConnection = {
      TartgetPerson: this.personsRepo.getDefaultPerson(),
      RelatedPerson: this.personsRepo.getDefaultPerson(),
      Relationship: { Id: -1, Type: eRel.Undecided },
      Flat: null
    };

    newConnection!.TartgetPerson!.Id = Math.max(...persons!.map(p => p.Id as number)) + 1;;
    newConnection!.TartgetPerson!.FullName = inputs.targetPersonFullName;
    newConnection!.TartgetPerson!.DateOfBirth = inputs.targetPersonDataOfBirth;
    newConnection!.TartgetPerson!.PlaceOfBirth = inputs.selectedPlaceOfBirthName;
    newConnection!.TartgetPerson!.Gender = inputs.selectedGenderId;
    newConnection!.RelatedPerson!.Id = inputs.selectedRelatedId;
    newConnection!.Relationship!.Id = inputs.selectedRelationId;

    var flatCon: IFlatConnection = {
      TartgetId: newConnection!.TartgetPerson!.Id as number,
      RelatedId: newConnection!.RelatedPerson!.Id as number,
      RelationshipId: newConnection!.Relationship!.Id
    };

    newConnection!.Flat = flatCon;

    newConnection!.TartgetPerson!.FlatConnections.push(flatCon);

    return newConnection;
  }

  calcConnections(newConnection: IConnection, persons: IPerson[]): IFlatConnection[] {
    persons!.push(newConnection!.TartgetPerson!)
    var newConnections = this.checkAllConnections(persons!);
    let flatCon = newConnection!.Flat!;
    var relatedPerson = persons?.find(p => p.Id == flatCon.RelatedId);
    var oppositeFlatCon = this.opposite(flatCon, relatedPerson!);
    newConnections.push(flatCon, oppositeFlatCon);
    return newConnections;
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

    let oppositeRel = this.calcSvc.opposite(flatCon, relatedPerson);

    return {
      TartgetId: flatCon.RelatedId,
      RelatedId: flatCon.TartgetId,
      RelationshipId: oppositeRel as number
    };
  }

  private checkAllConnections(persons: IPerson[]): IFlatConnection[] {
    let newConns: IFlatConnection[] = [];

    let possibleComplex: IFlatConnection[] = [];
    let undecidedConns: IUndecidedConnection[] = [];

    // reverse to start with the new added person
    persons.reverse();
    persons.forEach(person => {
      try {
        debugger;

        let personConns: IConnection[] = this.mapFlatConnections(person, persons);

        debugger;

        let relatedConns: IConnection[] = personConns
          .filter(c => c.RelatedPerson!.Id != person.Id)
          .flatMap(c => this.mapFlatConnections(c.RelatedPerson!, persons)
        );

        debugger;

        relatedConns.forEach(relatedConn => {
          let relation: eRel | null;
          let personConn = personConns.find(pc => pc.RelatedPerson!.Id == relatedConn.TartgetPerson!.Id);

          //ComplexRel -> Step, InLaw, Great, Ex, Far
          let possibleComplexRel: { val: eRel | null };

          let conns = this.cacheSvc.getCache(eStorageKeys.AllLocalConnections, eStorageType.Session); 
          this.calcSvc.initCalculation(personConn, relatedConn, conns;
          relation = this.calcSvc.findRelation(possibleComplexRel!, undecidedConns);
        });

      } catch (e) {
        let error = e;
      }
    });

    return newConns;
  }

  

  private mapFlatConnections(person: IPerson, persons: IPerson[]): IConnection[] {
    return person.FlatConnections.map(f => ({
      TartgetPerson: person,
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
