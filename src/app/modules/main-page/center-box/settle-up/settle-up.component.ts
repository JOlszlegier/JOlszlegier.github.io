import {Component, OnDestroy, OnInit} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {AuthApiService} from "../../../../core/services/auth-api-service";
import {Subscription} from "rxjs/";
import {UserBalanceService} from "../../../../core/services/user-balance-service";
import {CenterBoxService} from "../../../../core/services/center-box-service";
import {GroupService} from "../../../../core/services/group-service";
import {MatSnackBar,MatSnackBarModule} from "@angular/material/snack-bar";

@Component({
  selector: 'app-settle-up',
  templateUrl: './settle-up.component.html',
  styleUrls: ['./settle-up.component.scss']
})
export class SettleUpComponent implements OnInit,OnDestroy{
  private subscriptions = new Subscription()
  public whoYouOweTo: [string] = ['']
  public amountYouOweTo: [number] = [0];
  public valueOwedToUser: [{ to: number, value: number }] = [{to: 0, value: 0}]
  public difference: number = 0;
  public outcome: number = 0;
  public income: number = 0;
  public groupName$ = this.centerBoxService.selectedSource.asObservable();
  public groupName: string = '';
  public expensesArrayPlus$ = this.groupService.expensesArrayPlusSource.asObservable();
  public expensesArrayMinus$ = this.groupService.expensesArrayMinusSource.asObservable();
  public expensesArrayPlus: [{ description: string, amount: number }] = [{description: '1', amount: 0}]
  public expensesArrayMinus: [{ description: string, amount: number }] = [{description: '1', amount: 0}]

  constructor(private cookieService: CookieService, private authApiService: AuthApiService,
              private userBalanceService: UserBalanceService, private centerBoxService: CenterBoxService,
              private groupService: GroupService,private snackBar:MatSnackBar) {
  }

  ngOnInit(): void {
    this.groupName$.subscribe(groupName => this.groupName = groupName);
    const settleUpInfoSub = this.authApiService.settleUpInfo(this.cookieService.get('userId'), this.groupName).subscribe(data => {
      this.whoYouOweTo = data.userNames;
      for (const user in data.valueOwedToUser)
        this.amountYouOweTo[user] = data.valueOwedToUser[user].value;
      this.valueOwedToUser = data.valueOwedToUser;
    })
    this.subscriptions.add(settleUpInfoSub);
  }

  ngOnDestroy():void {
    this.subscriptions.unsubscribe();
  }

  onPayUp(): void {
    const settleUpSub = this.authApiService.settleUp(this.cookieService.get('userId'), this.valueOwedToUser, this.groupName).subscribe(
      data => {
        this.updateList();
        this.updateBalance();
        this.openSuccessSnackBar('You are settled up !')
      })
    this.subscriptions.add(settleUpSub);
  }

  updateBalance(): void {
    const incomeSub = this.userBalanceService.incomeSource.subscribe(income => this.income = income);
    const outcomeSub = this.userBalanceService.outcomeSource.subscribe(outcome => this.outcome = outcome);
    const differenceSub = this.userBalanceService.differenceSource.subscribe(difference => this.difference = difference)
    const balanceUpdateSub = this.authApiService.balanceCheck(this.cookieService.get('userId')).subscribe(data => {
      console.log(data);
      this.userBalanceService.onValuesChange(data.income, data.outcome);
      this.subscriptions.unsubscribe();
    })
    this.subscriptions.add(balanceUpdateSub);
    this.subscriptions.add(incomeSub);
    this.subscriptions.add(outcomeSub);
    this.subscriptions.add(differenceSub);
  }

  updateList(): void {
    this.expensesArrayMinus$.subscribe(array => this.expensesArrayMinus = array);
    this.expensesArrayPlus$.subscribe(array => this.expensesArrayPlus = array);
    const expensesSubPlus = this.authApiService.expensesInfoPlus(this.cookieService.get('userId'), this.groupName).subscribe(data => {
      this.expensesArrayPlus.splice(0, this.expensesArrayPlus.length);
      for (let expense in data.expensesArray) {
        this.expensesArrayPlus.push(data.expensesArray[expense]);
      }

    })
    const expensesSubMinus = this.authApiService.expensesInfoMinus(this.cookieService.get('userId'), this.groupName).subscribe(data => {
      this.expensesArrayMinus.splice(0, this.expensesArrayMinus.length);
      for (let expense in data.expensesArray) {
        this.expensesArrayMinus.push(data.expensesArray[expense]);
      }
    })
    this.subscriptions.add(expensesSubMinus);
    this.subscriptions.add(expensesSubPlus);
  }

  public openSuccessSnackBar(message:string):void{
    this.snackBar.open(message,'',{
      duration:3000,
      panelClass:['settle-up-success-snackbar'],
      horizontalPosition:"left",
      verticalPosition:'top'
    })
  }

}
