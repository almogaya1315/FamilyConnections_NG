import { Component } from '@angular/core';
import { delay, timer } from 'rxjs';
import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';
import { ConnectionsService } from '../services/connections.service';
import { StaticDataService } from '../services/static-data.service';
import { WaiterService } from '../services/waiter.service';
import { INameToId } from '../shared/common.model';
import { eGender, eProcessFrameSegment, eRel, IConnection, IConnectionSummary, IFlatConnection, IPerson, IProcessFrame } from './person.model';
import { PersonsRepositoryService } from './persons-repository.service';

@Component({
  selector: 'fc-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.css']
})
export class AddPersonComponent {
  persons: IPerson[] = [];
  selectedPlaceOfBirth: INameToId = { Id: -1, Name: '' };
  selectedGender: INameToId = { Id: -1, Name: '' };
  selectedRelated: INameToId = { Id: -1, Name: '' };
  selectedRelation: INameToId = { Id: -1, Name: '' };

  newConnection = this.connsSvc.defaultConnection();
  foundConns: IConnection[] = [];
  undecidedConns: IConnection[] = [];
  connsSumm: IConnectionSummary[] = [];

  inFoundTab: boolean = false;
  inUndecidedTab: boolean = false;

  countries: INameToId[];
  genders: INameToId[];
  personsItems: INameToId[] = [];
  relations: INameToId[] = [];

  spinnerWelcome: boolean = false;
  spinnerVerify: boolean = false;
  spinnerComplete: boolean = false;

  welcomeDisabled: boolean = false;
  verifyDisabled: boolean = true;
  completeDisabled: boolean = true;

  verifyVisible: boolean = false;
  completeVisible: boolean = false;
  processingFrameVisible: boolean = false;
  processFrame: IProcessFrame | null = null;

  constructor(
    private personsRepo: PersonsRepositoryService,
    private staticData: StaticDataService,
    private cacheSvc: CacheService,
    private connsSvc: ConnectionsService,
    private wait: WaiterService) {

    this.countries = this.staticData.getCountries();
    this.genders = this.staticData.getGenders();
    this.relations = this.staticData.getRelations();

    this.initProcessFrame();

    this.persons = this.cacheSvc.getCache<IPerson[]>(eStorageKeys.AllLocalPersons, eStorageType.Session)!;
    this.personsItems = this.persons!.map(p => ({
      Name: p.FullName,
      Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
    }));

    this.personsRepo.getConnections().subscribe((conns) => {
      this.cacheSvc.setCache(conns, eStorageKeys.AllLocalConnections, [eStorageType.Session]);
    });

    //this.personsRepo.getPersons().subscribe((personsData) => {
    //  if (personsData) {
    //    this.personsItems = personsData.map(p => ({
    //      Name: p.FullName,
    //      Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
    //    }));
    //  }
    //});
  }

  compareById = (a: any, b: any) => a?.Id === b?.Id;

  private initProcessFrame() {
    this.processFrame = {
      Title: eProcessFrameSegment.Title,
      PersonAddition: eProcessFrameSegment.Empty,
      NewConnsAddition: eProcessFrameSegment.Empty,
      NextActions: eProcessFrameSegment.Empty,
      AuthReqSent: eProcessFrameSegment.Empty
    };
  }

  private inputs() {
    return {
      selectedPlaceOfBirthName: this.selectedPlaceOfBirth.Name,
      selectedGenderId: this.selectedGender.Id,
      selectedRelatedId: this.selectedRelated.Id,
      selectedRelationId: this.selectedRelation.Id,
      targetPersonFullName: this.newConnection!.TargetPerson!.FullName,
      targetPersonDataOfBirth: this.newConnection!.TargetPerson!.DateOfBirth!,
    };
  }

  async next(credentials: any) {
    this.spinnerWelcome = true;
    this.undecidedConns = [];

    //existance validation - by name, relation & related authorization --> prevents progress to persistency if potential duplicated
    //permissions access security

    // process connections
    let newConnections = this.connsSvc.calcConnections(this.newConnection!, this.persons!, this.inputs(), this.undecidedConns);

    await this.wait.seconds(2);

    this.spinnerWelcome = false;
    this.welcomeDisabled = true;
    this.verifyDisabled = false;
    this.verifyVisible = true;
    this.inFoundTab = true;

    this.foundConns = newConnections.filter(c =>
      c.Relationship?.Id !== eRel.Undecided &&
      c.Relationship?.Id !== eRel.FarRel
    );
    this.foundConns.forEach(c => c.Confirmed = true);

    //testing
    //let lastThreeIndex = this.undecidedConns.length - 4;
    //let lastThree = this.undecidedConns.slice(lastThreeIndex, lastThreeIndex + 3);
    //lastThree.forEach(c => {
    //  c.Relationship!.Id = eRel.Undecided;
    //  c.Relationship!.Type = eRel[eRel.Undecided];
    //  c.UndecidedOptions = [{ Id: eRel.StepMother, Name: eRel[eRel.StepMother] }, { Id: eRel.StepFather, Name: eRel[eRel.StepFather] }]
    //});
    //testing
  }

  goToTab(tab: string) {
    if (tab == 'found' && !this.inFoundTab) {
      this.inFoundTab = true;
      this.inUndecidedTab = false;
    } else if (tab == 'undecided' && !this.inUndecidedTab) {
      this.inUndecidedTab = true;
      this.inFoundTab = false;
    }
  }

  async backTo(section: string) {
    if (section == 'welcome') {
      await this.backToWelcome();
    } else if (section == 'verify') {
      await this.backToVerify();
    }
  }

  allUndecidedSelected(): boolean {
    return this.undecidedConns.every(c => c.SelectedUndecided?.Id !== -1);
  }

  async final(credentials: any) {
    this.spinnerVerify = true;
    this.verifyDisabled = true;

    await this.wait.seconds(2);

    this.completeDisabled = false;
    this.completeVisible = true;

    this.connsSumm = this.connsSvc.summarize(this.foundConns, this.undecidedConns);

    this.spinnerVerify = false;
  }

  async complete() {
    this.completeDisabled = true;
    this.spinnerWelcome = true;
    this.spinnerVerify = true;
    this.spinnerComplete = true;
    await this.wait.seconds(1);
    this.processingFrameVisible = true;

    //set persistency texts
    this.saveNewPerson();
    //if (this.processFrame!.PersonAddition == eProcessFrameSegment.PersonAddition_Done)
    this.saveNewConns();
    //else {
    //SHOW ERROR & STOP PROCESS
    //}
    //if (this.processFrame!.NewConnsAddition == eProcessFrameSegment.NewConnsAddition_Done) {
    //UI that explains the following action to accure.
    this.processFrame!.NextActions = eProcessFrameSegment.NextActions;
    await this.wait.seconds(3);
    //a certain api call to wasap, to all required persons for authentication
    this.processFrame!.AuthReqSent = eProcessFrameSegment.AuthReqSent;
    //} else {
    //SHOW ERROR & STOP PROCESS
    //}

    //GO TO WAITING PAGE
    await this.wait.seconds(3);
    //navigate to url pendingPersonAuth

    //building a live api reciever for all responses, and managing person's permission into the website
  }

  private async saveNewPerson() {
    this.processFrame!.PersonAddition = eProcessFrameSegment.PersonAddition_InProgress;
    let segmentPersonAddition: eProcessFrameSegment;
    this.personsRepo.addPerson(this.newConnection!.TargetPerson!).subscribe(res => {
      if (res.Valid)
        segmentPersonAddition = eProcessFrameSegment.PersonAddition_Done;
      else segmentPersonAddition = eProcessFrameSegment.PersonAddition_Fail;
    });
    await this.wait.seconds(3);
    this.processFrame!.PersonAddition = segmentPersonAddition!;
  }
  private async saveNewConns() {
    this.processFrame!.NewConnsAddition = eProcessFrameSegment.NewConnsAddition_InProgress;
    let segmentNewConnsAddition: eProcessFrameSegment;
    let flats: IFlatConnection[] = [];
    this.foundConns.forEach(c => flats.push(c.Flat!));
    this.personsRepo.addConnections(flats).subscribe(res => {
      if (res.Valid)
        segmentNewConnsAddition = eProcessFrameSegment.NewConnsAddition_Done;
      else segmentNewConnsAddition = eProcessFrameSegment.NewConnsAddition_Fail;
    });
    await this.wait.seconds(3);
    this.processFrame!.NewConnsAddition = segmentNewConnsAddition!;
  }

  private async backToWelcome() {
    this.spinnerVerify = true;
    this.verifyDisabled = true;
    this.connsSvc.resetOperation(this.newConnection!, this.persons!, this.undecidedConns);

    await this.wait.seconds(1);
    this.spinnerVerify = false;
    this.welcomeDisabled = false;
  }
  private async backToVerify() {
    this.spinnerComplete = true;
    this.completeDisabled = true;
    await this.wait.seconds(1);
    this.spinnerComplete = false;
    this.verifyDisabled = false;
  }

  fillTest() {
    this.newConnection!.TargetPerson!.FullName = "Bar Friedman";
    this.newConnection!.TargetPerson!.DateOfBirth = new Date(1990, 1, 1);
    this.selectedPlaceOfBirth = this.countries.find(c => c.Id === 1)!;
    this.selectedGender = this.genders.find(g => g.Id === 1)!;
    this.selectedRelated = this.personsItems.find(p => p.Id === 2)!;
    this.selectedRelation = this.relations.find(r => r.Id === 10)!; //Cousin

    //this.newConnection!.TargetPerson!.FullName = "Emilia Elbaz";
    //this.newConnection!.TargetPerson!.DateOfBirth = new Date(2018, 1, 1);
    //this.selectedPlaceOfBirth = this.countries.find(c => c.Id === 1)!;
    //this.selectedGender = this.genders.find(g => g.Id === 1)!;
    //this.selectedRelated = this.personsItems.find(p => p.Id === 2)!;
    //this.selectedRelation = this.relations.find(r => r.Id === 8)!; //Aunt

    //this.newConnection!.TargetPerson!.FullName = "Henya Weintrob";
    //this.newConnection!.TargetPerson!.DateOfBirth = new Date(1949, 10, 20);
    //this.selectedPlaceOfBirth = this.countries.find(c => c.Id === 1)!;
    //this.selectedGender = this.genders.find(g => g.Id === 1)!;
    //this.selectedRelated = this.personsItems.find(p => p.Id === 2)!;
    //this.selectedRelation = this.relations.find(r => r.Id === 4)!; //Daughter

    //this.newConnection!.TargetPerson!.FullName = "Amit Elbaz";
    //this.newConnection!.TargetPerson!.DateOfBirth = new Date(1986, 11, 30);
    //this.selectedPlaceOfBirth = this.countries.find(c => c.Id === 1)!;
    //this.selectedGender = this.genders.find(g => g.Id === 0)!;
    //this.selectedRelated = this.personsItems.find(p => p.Id === 2)!;
    //this.selectedRelation = this.relations.find(r => r.Id === 18)!; //SisterInLaw
    ////this.selectedRelated = this.personsItems.find(p => p.Id === 3)!;
    ////this.selectedRelation = this.relations.find(r => r.Id === 11)!; //Niece
    ////this.selectedRelated = this.personsItems.find(p => p.Id === 1)!;
    ////this.selectedRelation = this.relations.find(r => r.Id === 19)!; //BrotherInLaw

    //this.newConnection!.TargetPerson!.FullName = "Racheli Paz";
    //this.newConnection!.TargetPerson!.DateOfBirth = new Date(1996, 2, 4);
    //this.selectedPlaceOfBirth = this.countries.find(c => c.Id === 1)!;
    //this.selectedGender = this.genders.find(g => g.Id === 1)!;
    //this.selectedRelated = this.personsItems.find(p => p.Id === 2)!;
    //this.selectedRelation = this.relations.find(r => r.Id === 2)!; //Sister
  }
}
