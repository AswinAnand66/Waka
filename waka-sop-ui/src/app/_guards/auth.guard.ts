import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ReusableComponent} from '../reusable/reusable.component'


@Injectable()
export class AuthGuard implements CanActivate {
    redirectUrl;
    constructor(
        private router: Router,
        private reusable: ReusableComponent
    ) { }

    canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(!this.reusable.loggedIn()){
            this.redirectUrl = state.url;
            this.router.navigate(['login']);
            return false;
        } else {
            return true;
        }
    }
}