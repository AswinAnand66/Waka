import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertComponent } from '../_directives/alert.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject, from } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reusable',
  templateUrl: './reusable.component.html',
  styleUrls: ['./reusable.component.css']
})

export class ReusableComponent implements OnInit {
  constructor(
    private _snackBar: MatSnackBar,
  ) { }

  screenChange: BehaviorSubject<{ height: number, width: number }> = new BehaviorSubject({ height: window.innerHeight-1, width: window.innerWidth });
  titleHeader: BehaviorSubject<string> = new BehaviorSubject('');
  headHt: BehaviorSubject<number> = new BehaviorSubject(0);
  pageData: BehaviorSubject<any> = new BehaviorSubject(undefined);
  curRoute: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
  redirectStatus = new BehaviorSubject<any>(undefined);
  device:string = 'desktop';
  orientation:string = 'landscape';
  refreshModules: BehaviorSubject<boolean> = new BehaviorSubject(false);

  ngOnInit() {
  }

  public static moduleColl: any = [
    { id: 2, name: "Role", icon: "manage_accounts", color: "#ffad00" },
    { id: 3, name: "LookUp", icon: "dns", color: "#000075", },
    { id: 4, name: "Company", icon: "business_center", color: "#4363d8", },
    { id: 5, name: "Document", icon: "summarize", color: "#3cb44b", },
    { id: 6, name: "Cargo Handling", icon: "precision_manufacturing", color: "#ac7c0a" },
    { id: 7, name: "PO & Booking", icon: "shopping_cart", color: "#911eb4" },
    { id: 8, name: "Port Management", icon: "flight_takeoff", color: "#ff5d00" },
    { id: 9, name: "Locations", icon: "travel_explore", color: "#469990" }
  ];

  public static token: string;
  public static usr: any;
  public static keyEncryptDecrypt: string;

  public storeKeys(token: any) {
    let data = JSON.parse(atob(token));
    let len = data.token.substring(0, 2);
    let keyLength = this.hexToShort(len);
    ReusableComponent.token = data.token;
    ReusableComponent.keyEncryptDecrypt = data.token.substring(data.token.length - keyLength);
    ReusableComponent.usr = data.user;
  }

  public openAlertMsg(msg, type) {
    this._snackBar.openFromComponent(AlertComponent, { data: { message: msg, type: type } });
  }

  public convertMstoTime(intMs) {
    if (isNaN(intMs)) return intMs;
    let ms = intMs % 1000;
    let Sec = Math.floor(intMs / 1000);
    let convSec = this.convertSecToTime(Sec);
    return convSec + "." + ms;
  }

  public convertSecToTime(intSeconds) {
    let hours = Math.floor(intSeconds / 3600);
    let minutes = Math.floor((intSeconds - (hours * 3600)) / 60);
    let sec = intSeconds - (hours * 3600) - (minutes * 60);
    let timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
    return timeString;
  }

  public convertToIndiaSystem(amount) {
    let strAmt = amount.toString();
    strAmt = strAmt.split('.')[0];
    let length = strAmt.length;
    let modAmt = '';
    if (length <= 3) {
      return strAmt + '.00';
    }
    modAmt = "," + strAmt.substring(strAmt.length - 3);
    if (length == 11) modAmt = strAmt.substring(0, 2) + "," + strAmt.substring(2, 4) + "," + strAmt.substring(4, 6) + "," + strAmt.substring(6, 8) + modAmt;
    else if (length == 10) modAmt = strAmt.substr(0, 1) + "," + strAmt.substring(1, 3) + "," + strAmt.substring(3, 5) + "," + strAmt.substring(5, 7) + modAmt;
    else if (length == 9) modAmt = strAmt.substring(0, 2) + "," + strAmt.substring(2, 4) + "," + strAmt.substring(4, 6) + modAmt;
    else if (length == 8) modAmt = strAmt.substr(0, 1) + "," + strAmt.substring(1, 3) + "," + strAmt.substring(3, 5) + modAmt;
    else if (length == 7) modAmt = strAmt.substring(0, 2) + "," + strAmt.substring(2, 4) + modAmt;
    else if (length == 6) modAmt = strAmt.substring(0, 1) + "," + strAmt.substring(1, 3) + modAmt;
    else if (length == 5) modAmt = strAmt.substring(0, 2) + modAmt;
    else if (length == 4) modAmt = strAmt.substring(0, 1) + modAmt;
    else {
      modAmt = strAmt;
    }
    return modAmt + '.00';
  }

  public convertDate(strDate) {
    let date = new Date(strDate);
    if (date.toString() == "Invalid Date") return strDate;
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }

  public convertDateTime(strDate) {
    let repStrDate = strDate.toString().replace(' ', '');
    if (!isNaN(repStrDate)) repStrDate = Number(repStrDate);
    let date = new Date(repStrDate);
    if (date.toString() == "Invalid Date") return strDate;
    return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  }

  public convertTime(strDate) {
    let date = new Date(strDate);
    if (date.toString() == "Invalid Date") return strDate;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  public randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public shortToHex(short: number) {
    return short.toString(16).padStart(2, "0");
  }

  public hexToShort(hex: string) {
    return parseInt(hex, 16);
  }

  public encrypt(val) {
    let eKey = ReusableComponent.keyEncryptDecrypt;
    let startNumber = this.hexToShort(eKey.substring(eKey.length - 2));
    var key = CryptoJS.enc.Utf8.parse(eKey.substring(startNumber, startNumber + 32));
    var iv = CryptoJS.enc.Hex.parse(this.randomString(32));
    var encrypted = CryptoJS.AES.encrypt(val, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC
    });
    var output = encrypted.ciphertext.toString();
    return iv + ":" + output;
  }

  public decrypt(val) {
    try {
      let dKey = ReusableComponent.keyEncryptDecrypt;
      let startNumber = this.hexToShort(dKey.substring(dKey.length - 2));
      var key = CryptoJS.enc.Utf8.parse(ReusableComponent.keyEncryptDecrypt.substring(startNumber, startNumber + 32));
      let keyVal = val.split(":");
      var iv = CryptoJS.enc.Hex.parse(keyVal[0]);
      var cipherText = CryptoJS.enc.Hex.parse(keyVal[1]);
      var options = { mode: CryptoJS.mode.CBC, iv: iv };
      var decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherText, iv: iv, salt: undefined }, key, options);
      let retVal = decrypted.toString(CryptoJS.enc.Utf8);
      return retVal
    } catch (err) {
      console.error(err);
      return "";
    }
  }

  public getAccessToken() {
    if (ReusableComponent.token == undefined) {
      if (sessionStorage.getItem('token') != undefined) {
        this.storeKeys(sessionStorage.getItem('token'));
      }
    }
    return ReusableComponent.token;
  }

  private tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  public loggedIn() {
    let token = this.getAccessToken();
    if (token == undefined) return false;
    if (this.tokenExpired(token.substring(2))) {
      return false;
    } else {
      return true;
    }
  }

  public cmp2Array(arr1, arr2) {
    if (arr1 == undefined || arr2 == undefined) return false;
    return arr1.sort().toString() == arr2.sort().toString();
  }

  public getMonthShortName(month) {
    if (Number(month).toString() == 'NaN') return month;
    if (month < 1 || month > 12) return month;
    let mon = 'mon' + month;
    let arrMonth = { mon1: 'Jan', mon2: 'Feb', mon3: 'Mar', mon4: 'Apr', mon5: 'May', mon6: 'Jun', mon7: 'Jul', mon8: 'Aug', mon9: 'Sep', mon10: 'Oct', mon11: 'Nov', mon12: 'Dec' }
    return arrMonth[mon];
  }

  public getMonthFullName(month) {
    if (Number(month).toString() == 'NaN') return month;
    if (month < 1 || month > 12) return month;
    let mon = 'mon' + month;
    let arrMonth = { mon1: 'January', mon2: 'February', mon3: 'March', mon4: 'April', mon5: 'May', mon6: 'June', mon7: 'July', mon8: 'August', mon9: 'September', mon10: 'October', mon11: 'November', mon12: 'December' }
    return arrMonth[mon];
  }
}


@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./reusable.component.css']
})
export class ConfirmDialog {

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialog,
  ) { document.body.className = "welcome-box-custom"; }

  ngOnDestroy() {
    document.body.className = "";
  }

  icon: string = 'info'
  type: string = this.data.type;
  content = this.data.content;
  redirect = this.data.redirect;
  details = this.data.details;
  isLoading = false;
  userName = ReusableComponent.usr['full_name'];

  async actionClose() {
    this.dialogRef.close(true);
  }

  async redirectToCompanyAddEdit() {
    this.dialogRef.close(true);
    this.router.navigate(['/nav/company/AddEditCompany']);
  }

  async redirectToCompany() {
    if((sessionStorage.getItem('pendingInviteColl') || sessionStorage.getItem('pendingContactInviteColl')) && this.router.url.includes('acceptdeny')){
      this.actionClose();
    } else {
      this.actionClose();
      this.router.navigate(['/nav/company']);
    }
  }

  async redirectToRole() {
    this.router.navigate(['/nav/roles']);
    this.actionClose();
  }

  async redirectToAddContact() {
    let elements = this.details;
    sessionStorage.setItem("CompanyContactParam", JSON.stringify(elements));
    this.router.navigate(['/nav/company/AddCompanyContact'], {state: {openAddContactDialog: true}});
    this.actionClose();
  }

  async redirectToRequestLicense() {
    let page = {
      licenseReq: true,
    }
    sessionStorage.setItem('redirect', JSON.stringify(page));
    window.location.reload();
    this.actionClose();
  }

  async redirectToInviteCompany() {
    let page = {
      inviteCompany: true,
    }
    sessionStorage.setItem('redirectcompany', JSON.stringify(page));
    window.location.reload();
    this.actionClose();
  }

  async actionReturn(action) {
    if (action) {
      this.redirect = true;
    } else {
      this.redirect = false;
    }
  }

  closeWithReturn(data: boolean): void {
    this.dialogRef.close(data);
  }

}