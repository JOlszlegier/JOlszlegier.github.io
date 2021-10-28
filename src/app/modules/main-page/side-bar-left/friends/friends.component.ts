import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Subscription} from "rxjs";
import {CookieService} from "ngx-cookie-service";

import {SearchService} from "../../../../core/services/search-service";
import {AuthApiService} from "../../../../core/services/auth-api-service";
import {FriendsService} from "../../../../core/services/friends-service";

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})

export class FriendsComponent implements OnInit, OnDestroy {

  public friendsList: string[] = [''];
  public searchPhrase: string = '';
  public newFriend: string = '';
  public subscriptions: Subscription = new Subscription();
  public errorMessage: string = '';
  public searchPhrase$ = this.searchService.searchSource.asObservable();
  public friendsList$ = this.friendsService.friendsList.asObservable();

  constructor(private searchService: SearchService, private authApiService: AuthApiService,
              private cookieService: CookieService, private friendsService: FriendsService, private snackBar: MatSnackBar) {
  }

  addFriend(friend: string): void {
    this.newFriend = '';
    const addFriendSub = this.authApiService.addFriend(this.cookieService.get('userId'), friend).subscribe(data => {
      this.friendsList = data.friends;
      if (data.errorMessage) {
        this.openErrorSnackBar(data.errorMessage);
      } else if (data.successMessage) {
        this.openSuccessSnackBar(data.successMessage);
        this.friendsService.friendsList.next(this.friendsList);
      }
    })
    this.subscriptions.add(addFriendSub);
  }

  ngOnInit(): void {
    this.searchPhrase$.subscribe(searchPhrase => this.searchPhrase = searchPhrase);
    this.friendsList$.subscribe(friendsList => this.friendsList = friendsList);
    this.getFriends();
  }

  getFriends(): void {
    const updateFriendsListSub = this.authApiService.getFriendsList(this.cookieService.get('userId')).subscribe(data => {
      this.friendsList = data.friends;
      this.friendsService.friendsList.next(this.friendsList);
    })
    this.subscriptions.add(updateFriendsListSub);
  }

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, '', {
      panelClass: ['friends-error-snackbar'],
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top',
    });
  }

  openSuccessSnackBar(message: string): void {
    this.snackBar.open(message, '', {
      panelClass: ['friends-success-snackbar'],
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top',
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

}
