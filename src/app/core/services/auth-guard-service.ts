import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {CookieService} from "ngx-cookie-service";

@Injectable({providedIn: 'root'})
export class AuthGuardService implements CanActivate {


  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {
  }

  // token verification,might be useful
  // public tokenVerificationURL = 'http://localhost:3000/token-verification'
  // public isLoggedIn: boolean = false;
  // public async tokenCheck() {
  //   await this.http.get(this.tokenVerificationURL,).subscribe(res => {
  //     this.isLoggedIn = true;
  //   }, err => {
  //     this.isLoggedIn = false;
  //   });
  // }


  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let currentDate = new Date();
    let expirationDate = Number(this.cookieService.get('expiration-date'))
    if (!!this.cookieService.get('token') && expirationDate > currentDate.getTime()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
