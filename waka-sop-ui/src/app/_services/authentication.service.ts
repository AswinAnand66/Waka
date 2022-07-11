import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { ReusableComponent } from '../reusable/reusable.component'
import { environment } from '../../environments/environment';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
    domain = environment.domain;
    uploaderResp:string;

    private sessionStorage = new Subject<boolean>();

    constructor(
        private http: HttpClient,
        private router: Router,
        private reusable: ReusableComponent
    ) {}

    storeSessionData(data){
        data = JSON.parse(data);
        this.setItem('token',data.token);
        this.setItem('apdUser', data.user.name);
        // this.setItem('apdUserDet', JSON.stringify(data.user));
    }

    watchStorage(): Observable<any> {
        return this.sessionStorage.asObservable();
    }

    setItem(key: string, data: any) {
        sessionStorage.setItem(key, data);
        // sessionStorage.setItem(key, data);
        this.sessionStorage.next(true);
    }

    removeItem(key) {
        sessionStorage.removeItem(key);
        // sessionStorage.removeItem(key);
        this.sessionStorage.next(false);
    }
    
    logout() {
        sessionStorage.clear();
        ReusableComponent.usr = undefined;
        ReusableComponent.token = undefined;
        ReusableComponent.keyEncryptDecrypt = undefined;
        // sessionStorage.clear();
    }
  
    invalidSession(resp){
        let msg;
        if (resp.invalidToken) {
            msg = 'Session expired, please login again.';
            this.logout();
            this.router.navigate(['/login']);
        } else if (!resp.success) {
            if (resp.message != undefined) {
                if (resp.message.includes('duplicate')){
                    resp.message = "Already Exists";
                }
                msg = resp.message;
            }
        }
        return msg;
    }

    savePageAccess(startTime, endTime, url, page_name){
        let duration_ms = endTime.getTime() - startTime.getTime();
        let param = {
            user_id: ReusableComponent.usr.user_id,
            email: ReusableComponent.usr.email,
            name: ReusableComponent.usr.full_name,
            url: url,
            page_name: page_name,
            start_time: startTime,
            end_time: endTime,
            duration_ms: duration_ms
        }
        this.http.post<any>( this.domain +'/api/savePageAccess',param).toPromise();
    }
    
    async login(user){
        return this.http.post<any>( this.domain +'/api/login',user).toPromise();
    }
    async logoutUser(data) {
        return this.http.post<any>(this.domain+'/api/logoutUser',data).toPromise();
    }
    async userValidation(data) {
        return this.http.post<any>(this.domain+'/api/userValidation',data).toPromise();
    }
    async getTotalCntByModule(data) {
        return this.http.post<any>(this.domain+'/api/getTotalCntByModule',data).toPromise();
    }
    async getContractsByAcc(param) {
        return this.http.post<any>(this.domain+'/api/getContractsByAcc', param).toPromise();
    }
    async getLookupValuesForContractByCompany(param) {
        return this.http.post<any>(this.domain+'/api/getLookupValuesForContractByCompany', param).toPromise();
    }
    async getItemTypes(param) {
        return this.http.post<any>(this.domain+'/api/getItemTypes', param).toPromise();
    }
    async getServices(param) {
        return this.http.post<any>(this.domain+'/api/getServices', param).toPromise();
    }
    async addContract(param) {
        return this.http.post<any>(this.domain+'/api/addContract', param).toPromise();
    }
    async extendContractValidity(param) {
        return this.http.post<any>(this.domain+'/api/extendContractValidity', param).toPromise();
    }
    async updateContract(param) {
        return this.http.post<any>(this.domain+'/api/updateContract', param).toPromise();
    }
    //getCarrier
    /*New Code */
    async getBuyer() {
        return this.http.get<any>(this.domain+'/api/getBuyer').toPromise();
    }
    async getFF() {
        return this.http.get<any>(this.domain+'/api/getFF').toPromise();
    }
    async getFFListForAddSOP(param) {
        return this.http.post<any>(this.domain+'/api/getFFListForAddSOP', param).toPromise();
    }
    async getDocs() {
        return this.http.get<any>(this.domain+'/api/getDocs').toPromise();
    }
    async getLookupValuesForSOP(param) {
        return this.http.post<any>(this.domain+'/api/getLookupValuesForSOP', param).toPromise();
    }
    async getPorts() {
        return this.http.get<any>(this.domain+'/api/getPorts').toPromise();
    }
    async getCountry() {
        return this.http.get<any>(this.domain+'/api/getCountry').toPromise();
    }
    async getCarrier() {
        return this.http.get<any>(this.domain+'/api/getCarrier').toPromise();
    }
    async getCountryCode() {
        return this.http.get<any>(this.domain+'/api/getCountryCode').toPromise();
    }
    async validateEmail(param) {
        return this.http.post<any>(this.domain+'/api/validateEmail', param).toPromise();
    }
    async checkEmail(param) {
        return this.http.post<any>(this.domain+'/api/checkEmail', param).toPromise();
    }
    async checkEmailLinkVerified(param) {
        return this.http.post<any>(this.domain+'/api/checkEmailLinkVerified', param).toPromise();
    }
    async getCompanyData(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyDataForinvite', param).toPromise();
    }
    async getOTP(param) {
        return this.http.post<any>(this.domain+'/api/getOTP', param).toPromise();
    }
    async validateOTP(param) {
        return this.http.post<any>(this.domain+'/api/validateOTP', param).toPromise();
    }
    async changeForgottenPassword(param) {
        return this.http.post<any>(this.domain+'/api/changeForgottenPassword', param).toPromise();
    }
    async changePassword(param) {
        return this.http.post<any>(this.domain+'/api/changePassword', param).toPromise();
    }
    async updateProfile(param) {
        return this.http.post<any>(this.domain+'/api/updateProfile', param).toPromise();
    }
    async insSOP(param) {
        return this.http.post<any>(this.domain+'/api/insSOP', param).toPromise();
    }
    async insUpdContact(param) {
        return this.http.post<any>(this.domain+'/api/insUpdContact', param).toPromise();
    }
    async getSOPContacts(param) {
        return this.http.post<any>(this.domain+'/api/getSOPContacts', param).toPromise();
    }
    async delSOPContacts(param) {
        return this.http.post<any>(this.domain+'/api/delSOPContacts', param).toPromise();
    }
    async getSOPContactPorts(param) {
        return this.http.post<any>(this.domain+'/api/getSOPContactPorts', param).toPromise();
    }
    async getSOPDocs(param) {
        return this.http.post<any>(this.domain+'/api/getSOPDocs', param).toPromise();
    }
    async saveDocs(param) {
        return this.http.post<any>(this.domain+'/api/saveDocs', param).toPromise();
    }
    async getSOPs() {
        return this.http.get<any>(this.domain+'/api/getSOPs').toPromise();
    }
    async getCountryLookup() {
        return this.http.get<any>(this.domain+'/api/getCountryLookup').toPromise();
    }
    async getStateLookup() {
        return this.http.get<any>(this.domain+'/api/getStateLookup').toPromise();
    }
    async getCityLookup() {
        return this.http.get<any>(this.domain+'/api/getCityLookup').toPromise();
    }
    async validateCompanyOwner(param) {
        return this.http.post<any>(this.domain+'/api/validateCompanyOwner', param).toPromise();
    }
    async validateCompanyName(param) {
        return this.http.post<any>(this.domain+'/api/validateCompanyName', param).toPromise();
    }
    async getCompanyTypeLookup() {
        return this.http.get<any>(this.domain+'/api/getCompanyTypeLookup').toPromise();
    }
    async insUpdCompany(param) {
        return this.http.post<any>(this.domain+'/api/insUpdCompany', param).toPromise();
    }
    async getCompanyBasicDetails(param){
        return this.http.post<any>(this.domain+'/api/getCompanyBasicDetails', param).toPromise();
    }
    async delCompany(param) {
        return this.http.post<any>(this.domain+'/api/delCompany', param).toPromise();
    }
    async getInviteCompany(param) {
        return this.http.post<any>(this.domain+'/api/getInviteCompany', param).toPromise();
    }
    async inviteCompnay(param) {
        return this.http.post<any>(this.domain+'/api/inviteCompnay', param).toPromise();
    }
    async updinviteCompany(param) {
        return this.http.post<any>(this.domain+'/api/updinviteCompany', param).toPromise();
    }
    async delInviteCompany(param) {
        return this.http.post<any>(this.domain+'/api/delInviteCompany', param).toPromise();
    }
    async validateInviteeCompanyName(param) {
        return this.http.post<any>(this.domain+'/api/validateInviteeCompanyName', param).toPromise();
    }
    async addCompanyContact(param) {
        return this.http.post<any>(this.domain+'/api/addCompanyContact', param).toPromise();
    }
    async updCompanyContact(param) {
        return this.http.post<any>(this.domain+'/api/updCompanyContact', param).toPromise();
    }
    async getCompanyContactDetails(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyContactDetails', param).toPromise();
    }
    async delCompanyContact(param) {
        return this.http.post<any>(this.domain+'/api/delCompanyContact', param).toPromise();
    }
    async getCompanyTypeList() {
        return this.http.get<any>(this.domain+'/api/getCompanyTypeList').toPromise();
    }
    async getRoleNameForCompany(param) {
        return this.http.post<any>(this.domain+'/api/getRoleNameForCompany',param).toPromise();
    }
    async getInviteCompanyLicensedModulesList(param) {
        return this.http.post<any>(this.domain+'/api/getInviteCompanyLicensedModulesList',param).toPromise();
    }
    async getSOPCompany(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCompany', param).toPromise();
    }
    async delSOPCompany(param) {
        return this.http.post<any>(this.domain+'/api/delSOPCompany', param).toPromise();
    }
    async getAllCompForSOP(param) {
        return this.http.post<any>(this.domain+'/api/getAllCompForSOP', param).toPromise();
    }
    async addRemoveSOPCompanies(param) {
        return this.http.post<any>(this.domain+'/api/addRemoveSOPCompanies', param).toPromise();
    }
    async getCHGrp() {
        return this.http.get<any>(this.domain+'/api/getCHGrp').toPromise();
    }
    async getSOPCHForGroup(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCHForGroup', param).toPromise();
    }
    async checkCreateCHForSOP(param) {
        return this.http.post<any>(this.domain+'/api/checkCreateCHForSOP', param).toPromise();
    }
    async updSOPCHIsSelected(param) {
        return this.http.post<any>(this.domain+'/api/updSOPCHIsSelected', param).toPromise();
    }
    async updSOPCHOptimalValue(param) {
        return this.http.post<any>(this.domain+'/api/updSOPCHOptimalValue', param).toPromise();
    }
    async updSOPCHfields(param) {
        return this.http.post<any>(this.domain+'/api/updSOPCHfields', param).toPromise();
    }
    async getUserCompany(param) {
        return this.http.post<any>(this.domain+'/api/getUserCompany', param).toPromise();
    }
    async getRoleStatForCompAdmin(param) {
        return this.http.post<any>(this.domain+'/api/getRoleStatForCompAdmin', param).toPromise();
    }
    async getRoleStatForAdmin() {
        return this.http.get<any>(this.domain+'/api/getRoleStatForAdmin').toPromise();
    }
    async getUserStat() {
        return this.http.get<any>(this.domain+'/api/getUserStat').toPromise();
    }
    async getAllUsers() {
        return this.http.get<any>(this.domain+'/api/getAllUsers').toPromise();
    }
    async checkUsrEmailExists(param) {
        return this.http.post<any>(this.domain+'/api/checkUsrEmailExists', param).toPromise();
    }
    async registerUser(param) {
        return this.http.post<any>(this.domain+'/api/registerUser', param).toPromise();
    }
    async updUser(param) {
        return this.http.post<any>(this.domain+'/api/updUser', param).toPromise();
    }
    async delUsr(param) {
        return this.http.post<any>(this.domain+'/api/delUsr', param).toPromise();
    }
    async activateUser(param) {
        return this.http.post<any>(this.domain+'/api/activateUser', param).toPromise();
    }
    async getAllCompanyType() {
        return this.http.get<any>(this.domain+'/api/getAllCompanyType').toPromise();
    }
    async insUserCompany(param) {
        return this.http.post<any>(this.domain+'/api/insUserCompany', param).toPromise();
    }
    async getUserStatForCompAdmin() {
        return this.http.get<any>(this.domain+'/api/getUserStatForCompAdmin').toPromise();
    }
    async getUsersForCompAdmin() {
        return this.http.get<any>(this.domain+'/api/getUsersForCompAdmin').toPromise();
    }
    async insUsrCompanyForCompAdmin(param) {
        return this.http.post<any>(this.domain+'/api/insUsrCompanyForCompAdmin', param).toPromise();
    }
    async getAdminRoles(param) {
        return this.http.post<any>(this.domain+'/api/getAdminRoles',param).toPromise();
    }
    async getAdminLookups() {
        return this.http.get<any>(this.domain+'/api/getAdminLookups').toPromise();
    }
    async getLookup(param) {
        return this.http.post<any>(this.domain+'/api/getLookup', param).toPromise();
    }
    async getAdminCompany() {
        return this.http.get<any>(this.domain+'/api/getAdminCompany').toPromise();
    }
    async getInviteUser(param) {
        return this.http.post<any>(this.domain+'/api/getInviteUser', param).toPromise();
    }
    async getUsersCompany() {
        return this.http.get<any>(this.domain+'/api/getUsersCompany').toPromise();
    }
    async getInvitedCompaniesList(param) {
        return this.http.post<any>(this.domain+'/api/getInvitedCompaniesList',param).toPromise();
    }
    getCompanyLogo(param) {
        return this.http.post(this.domain+'/api/getCompanyLogo',param, {responseType:'blob', headers:new HttpHeaders().append('content-type','application/json')});
    }
    async removeCompanyLogo(param) {
        return this.http.post<any>(this.domain+'/api/removeCompanyLogo', param).toPromise();
    }
    async getCompanyRegDetails(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyRegDetails', param).toPromise();
    }
    async getCompanyAddressDetails(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyAddressDetails', param).toPromise();
    }
    async getCompanyAllAddressDetails(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyAllAddressDetails', param).toPromise();
    }
    async getCompanyUnqRoleName(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyUnqRoleName', param).toPromise();
    }
    async getModulesAndRolesForCompany(param) {
        return this.http.post<any>(this.domain+'/api/getModulesAndRolesForCompany', param).toPromise();
    }
    async getExistingRoleDetails(param){
        return this.http.post<any>(this.domain+'/api/getExistingRoleDetails',param).toPromise();
    }
    async insRole(param) {
        return this.http.post<any>(this.domain+'/api/insRole', param).toPromise();
    }
    async getSOPContainer(param) {
        return this.http.post<any>(this.domain+'/api/getSOPContainer', param).toPromise();
    }
    async insSOPContainer(param) {
        return this.http.post<any>(this.domain+'/api/insSOPContainer', param).toPromise();
    }
    async updSOPContainer(param) {
        return this.http.post<any>(this.domain+'/api/updSOPContainer', param).toPromise();
    }
    async removeSOPContainer(param) {
        return this.http.post<any>(this.domain+'/api/removeSOPContainer', param).toPromise();
    }
    async getSOPCarrierAlloc(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierAlloc', param).toPromise();
    }
    async insSOPCarrierAlloc(param) {
        return this.http.post<any>(this.domain+'/api/insSOPCarrierAlloc', param).toPromise();
    }
    async updSOPCarrierAlloc(param) {
        return this.http.post<any>(this.domain+'/api/updSOPCarrierAlloc', param).toPromise();
    }
    async removeSOPCarrierAlloc(param) {
        return this.http.post<any>(this.domain+'/api/removeSOPCarrierAlloc', param).toPromise();
    }
    async getSOPCarrierAllocByPort(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierAllocByPort', param).toPromise();
    }
    async delSOPCarrierAllocForPort(param) {
        return this.http.post<any>(this.domain+'/api/delSOPCarrierAllocForPort', param).toPromise();
    }

    async getSOPId(param) {
        return this.http.post<any>(this.domain+'/api/getSOPId', param).toPromise();
    }

    async getSOPCarrierPref(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierPref', param).toPromise();
    }
    async insSOPCarrierPref(param) {
        return this.http.post<any>(this.domain+'/api/insSOPCarrierPref', param).toPromise();
    }
    async updSOPCarrierPref(param) {
        return this.http.post<any>(this.domain+'/api/updSOPCarrierPref', param).toPromise();
    }
    async removeSOPCarrierPref(param) {
        return this.http.post<any>(this.domain+'/api/removeSOPCarrierPref', param).toPromise();
    }
    async getSOPCarrierPrefByPort(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierPrefByPort', param).toPromise();
    }
    async delSOPCarrierPrefForPort(param) {
        return this.http.post<any>(this.domain+'/api/delSOPCarrierPrefForPort', param).toPromise();
    }
    async getSOPPOBForGroup(param) {
        return this.http.post<any>(this.domain+'/api/getSOPPOBForGroup', param).toPromise();
    }
    async getSOPDocForGroup(param) {
        return this.http.post<any>(this.domain+'/api/getSOPDocForGroup', param).toPromise();
    }
    async getSOPLCForGroup(param) {
        return this.http.post<any>(this.domain+'/api/getSOPLCForGroup', param).toPromise();
    }
    async getSOPCarrierForGroup(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierForGroup', param).toPromise();
    }
    async getSopPortCountryWiseList(param) {
        return this.http.post<any>(this.domain+'/api/getSopPortCountryWiseList', param).toPromise();
    }
    async getSOPConsigneeContacts(param) {
        return this.http.post<any>(this.domain+'/api/getSOPConsigneeContacts', param).toPromise();
    }
    async getSOPFFContacts(param) {
        return this.http.post<any>(this.domain+'/api/getSOPFFContacts', param).toPromise();
    }
    async getSOPSchInvForGroup(param) {
        return this.http.post<any>(this.domain+'/api/getSOPSchInvForGroup', param).toPromise();
    }
    async checkCreatePOBForSOP(param) {
        return this.http.post<any>(this.domain+'/api/checkCreatePOBForSOP', param).toPromise();
    }
    async checkCreateLCForSOP(param) {
        return this.http.post<any>(this.domain+'/api/checkCreateLCForSOP', param).toPromise();
    }
    async checkCreateCarrierForSOP(param) {
        return this.http.post<any>(this.domain+'/api/checkCreateCarrierForSOP', param).toPromise();
    }
    async checkCreateDocForSOP(param) {
        return this.http.post<any>(this.domain+'/api/checkCreateDocForSOP', param).toPromise();
    }
    async checkCreateInvForSOP(param) {
        return this.http.post<any>(this.domain+'/api/checkCreateInvForSOP', param).toPromise();
    }
    async updSOPPOBIsSelected(param) {
        return this.http.post<any>(this.domain+'/api/updSOPPOBIsSelected', param).toPromise();
    }
    async updSOPPOBfields(param) {
        return this.http.post<any>(this.domain+'/api/updSOPPOBfields', param).toPromise();
    }
    async updSOPLCfields(param) {
        return this.http.post<any>(this.domain+'/api/updSOPLCfields', param).toPromise();
    }
    async updSOPCarrierfields(param) {
        return this.http.post<any>(this.domain+'/api/updSOPCarrierfields', param).toPromise();
    }
    async updSOPSchInvfields(param) {
        return this.http.post<any>(this.domain+'/api/updSOPSchInvfields', param).toPromise();
    }
    async getPOBGrp() {
        return this.http.get<any>(this.domain+'/api/getPOBGrp').toPromise();
    }
    async getDocGrp() {
        return this.http.get<any>(this.domain+'/api/getDocGrp').toPromise();
    }
    async updDocFieldValue(param) {
        return this.http.post<any>(this.domain+'/api/updDocFieldValue', param).toPromise();
    }
    async updDocisSelected(param) {
        return this.http.post<any>(this.domain+'/api/updDocisSelected', param).toPromise();
    }
    async updCarrierisSelected(param) {
        return this.http.post<any>(this.domain+'/api/updCarrierisSelected', param).toPromise();
    }
    async copySOPCompany(param) {
        return this.http.post<any>(this.domain+'/api/copySOPCompany', param).toPromise();
    }
    async copySOPContact(param) {
        return this.http.post<any>(this.domain+'/api/copySOPContact', param).toPromise();
    }
    async copySOPContactPort(param) {
        return this.http.post<any>(this.domain+'/api/copySOPContactPort', param).toPromise();
    }
    async copySOPDocs(param) {
        return this.http.post<any>(this.domain+'/api/copySOPDocs', param).toPromise();
    }
    async copySOPPOBooking(param) {
        return this.http.post<any>(this.domain+'/api/copySOPPOBooking', param).toPromise();
    }
    async copySOPCargoHandling(param) {
        return this.http.post<any>(this.domain+'/api/copySOPCargoHandling', param).toPromise();
    }
    async copySOPContainer(param) {
        return this.http.post<any>(this.domain+'/api/copySOPContainer', param).toPromise();
    }
    async copySOPCarrierAlloc(param) {
        return this.http.post<any>(this.domain+'/api/copySOPCarrierAlloc', param).toPromise();
    }
    async copySOPCarrierPref(param) {
        return this.http.post<any>(this.domain+'/api/copySOPCarrierPref', param).toPromise();
    }
    async delSOP(param) {
        return this.http.post<any>(this.domain+'/api/delSOP', param).toPromise();
    }
    async getCompanyForId(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyForId', param).toPromise();
    }
    async getLookupTypeList() {
        return this.http.get<any>(this.domain+'/api/getLookupTypeList').toPromise();
    }
    async getServiceTypeList() {
        return this.http.get<any>(this.domain+'/api/getServiceTypeList').toPromise();
    }
    async getserviceTypeColl(param) {
        return this.http.post<any>(this.domain+'/api/getserviceTypeColl', param).toPromise();
    }
    async getCompanyList() {
        return this.http.get<any>(this.domain+'/api/getCompanyList').toPromise();
    }
    async getPrincipalListForSop() {
        return this.http.get<any>(this.domain+'/api/getPrincipalListForSop').toPromise();
    }
    async getPrincipalListForContract() {
        return this.http.get<any>(this.domain+'/api/getPrincipalListForContract').toPromise();
    }
    async getStakeholderList(param) {
        return this.http.post<any>(this.domain+'/api/getStakeholderList', param).toPromise();
    }
    async addLookupEntry(param) {
        return this.http.post<any>(this.domain+'/api/addLookupEntry', param).toPromise();
    }
    async updateLookupEntry(param) {
        return this.http.post<any>(this.domain+'/api/updateLookupEntry', param).toPromise();
    }
    async addServiceEntry(param) {
        return this.http.post<any>(this.domain+'/api/addServiceEntry', param).toPromise();
    }
    async updateServiceEntry(param) {
        return this.http.post<any>(this.domain+'/api/updateServiceEntry', param).toPromise();
    }
    async delServiceEntry(param) {
        return this.http.post<any>(this.domain+'/api/delServiceEntry', param).toPromise();
    }
    async delLookup(param) {
        return this.http.post<any>(this.domain+'/api/delLookupName', param).toPromise();
    }
    async insCompany(param) {
        return this.http.post<any>(this.domain+'/api/insCompany', param).toPromise();
    }
    async UpdCompany(param) {
        return this.http.post<any>(this.domain+'/api/UpdCompany', param).toPromise();
    }
    async getAddressTypeList() {
        return this.http.get<any>(this.domain+'/api/getAddressTypeList').toPromise();
    }
    async getParentCompanyList(param) {
        return this.http.post<any>(this.domain+'/api/getParentCompanyList', param).toPromise();
    }
    async getTaxRegistrationList() {
        return this.http.get<any>(this.domain+'/api/getTaxRegistrationList').toPromise();
    }
    async getOfficeTypeList() {
        return this.http.get<any>(this.domain+'/api/getOfficeTypeList').toPromise();
    }
    async getCountryListForCompany() {
        return this.http.get<any>(this.domain+'/api/getCountryListForCompany').toPromise();
    }
    async getStateListForCompany(param) {
        return this.http.post<any>(this.domain+'/api/getStateListForCompany', param).toPromise();
    }
    async getCityListForCompany(param) {
        return this.http.post<any>(this.domain+'/api/getCityListForCompany', param).toPromise();
    }
    async checkParentCompany(param) {
        return this.http.post<any>(this.domain+'/api/checkParentCompany',param).toPromise();
    }
    async getDocumentLookup() {
        return this.http.get<any>(this.domain+'/api/getDocumentLookup').toPromise();
    }
    async getLookupTypeId(param) {
        return this.http.post<any>(this.domain+'/api/getLookupTypeId', param).toPromise();
    }
    async insReq(param) {
        return this.http.post<any>(this.domain+'/api/insReq', param).toPromise();
    }
    async getRoles(param) {
        return this.http.post<any>(this.domain+'/api/getRoles',param).toPromise();
    }
    async deleteRole(param){
        return this.http.post<any>(this.domain + '/api/deleteRole', param).toPromise();
    }
    async updRole(param) {
        return this.http.post<any>(this.domain+'/api/updRole', param).toPromise();
    }
    async getRolePermissionForExist(param){
        return this.http.post<any>(this.domain+'/api/getRolePermissionForExist', param).toPromise();
    }
    async validateRoleName(param) {
        return this.http.post<any>(this.domain+'/api/validateRoleName', param).toPromise();
    }

    async getLicenseCompanyForRoles() {
        return this.http.get<any>(this.domain+'/api/getLicenseCompanyForRoles').toPromise();
    }
    async getModules(param) {
        return this.http.post<any>(this.domain+'/api/getModules', param).toPromise();
    }
    async getModulesList(param) {
        return this.http.post<any>(this.domain+'/api/getModulesList', param).toPromise();
    }
    async getSubModules(param) {
        return this.http.post<any>(this.domain+'/api/getSubModules',param).toPromise();
    }
    async addModule(param) {
        return this.http.post<any>(this.domain+'/api/addModule', param).toPromise();
    }
    async updateModule(param) {
        return this.http.post<any>(this.domain+'/api/updateModule', param).toPromise();
    }
    async addSubModule(param) {
        return this.http.post<any>(this.domain+'/api/addSubModule', param).toPromise();
    }
    async updateSubModule(param) {
        return this.http.post<any>(this.domain+'/api/updateSubModule', param).toPromise();
    }
    async getRequirement(param){
        return this.http.post<any>(this.domain+'/api/getRequirement', param).toPromise();
    }
    async delRequirement(param){
        return this.http.post<any>(this.domain+'/api/delRequirement', param).toPromise();
    }
    async insCompanyLicense(param){
        return this.http.post<any>(this.domain+'/api/insCompanyLicense',param).toPromise();
    }
    async getlicenseModules(param){
        return this.http.post<any>(this.domain+'/api/getlicenseModules',param).toPromise();
    }
    async getSharedLicenseModules(param){
        return this.http.post<any>(this.domain+'/api/getSharedLicenseModules',param).toPromise();
    }
    async updCompanyLicense(param){
        return this.http.post<any>(this.domain+'/api/updCompanyLicense',param).toPromise();
    }
    async approveLicenseStatus(param){
        return this.http.post<any>(this.domain+'/api/approveLicenseStatus',param).toPromise();
    }
    async revokeLicenseStatus(param){
        return this.http.post<any>(this.domain+'/api/revokeLicenseStatus',param).toPromise();
    }
    async getLicenseDetails(){
        return this.http.get<any>(this.domain+'/api/getLicenseDetails').toPromise();
    }
    async getInviteCompanySharedLicensedModulesList(param) {
        return this.http.post<any>(this.domain+'/api/getInviteCompanySharedLicensedModulesList',param).toPromise();
    }
    async checkPrevCompInvit(param) {
        return this.http.post<any>(this.domain+'/api/checkPrevCompInvit',param).toPromise();
    }

    async getPendingInviteForEmail(param) {
        return this.http.post<any>(this.domain+'/api/getPendingInviteForEmail',param).toPromise();
    }

    async getPendingContactInviteForEmail(param) {
        return this.http.post<any>(this.domain+'/api/getPendingContactInviteForEmail',param).toPromise();
    }

    async updCompanyInviteAccept(param) {
        return this.http.post<any>(this.domain+'/api/updCompanyInviteAccept',param).toPromise();
    }

    async updContactInviteAccept(param) {
        return this.http.post<any>(this.domain+'/api/updContactInviteAccept',param).toPromise();
    }

    async getLicensedModulesForUser(){
        return this.http.get<any>(this.domain+'/api/getLicensedModulesForUser').toPromise();
    }

    async insSOPCountry(param) {
        return this.http.post<any>(this.domain+'/api/insSOPCountry',param).toPromise();
    }

    async getSOPCountries(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCountries',param).toPromise();
    }

    async getAllInvitedCompanyForCountry(param) {
        return this.http.post<any>(this.domain+'/api/getAllInvitedCompanyForCountry',param).toPromise();
    }

    async getAddressForCompanyId(param) {
        return this.http.post<any>(this.domain+'/api/getAddressForCompanyId',param).toPromise();
    }

    async getCompanyContacts(param) {
        return this.http.post<any>(this.domain+'/api/getCompanyContacts',param).toPromise();
    }

    async getSOPServices(param) {
        return this.http.post<any>(this.domain+'/api/getSOPServices',param).toPromise();
    }

    async insSOPServices(param) {
        return this.http.post<any>(this.domain+'/api/insSOPServices',param).toPromise();
    }

    async inviteContactApproveRevoke(param) {
        return this.http.post<any>(this.domain+'/api/inviteContactApproveRevoke',param).toPromise();
    }

    async inviteCompanyApproveRevoke(param) {
        return this.http.post<any>(this.domain+'/api/inviteCompanyApproveRevoke',param).toPromise();
    }

    async delSOPDoc(param) {
        return this.http.post<any>(this.domain+'/api/delSOPDoc',param).toPromise();
    }

    async getSOPCommunication(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCommunication',param).toPromise();
    }

    async insSOPCommunication(param) {
        return this.http.post<any>(this.domain+'/api/insSOPCommunication',param).toPromise();
    }

    async updSOPCommunication(param) {
        return this.http.post<any>(this.domain+'/api/updSOPCommunication',param).toPromise();
    }

    async delSOPCommunication(param) {
        return this.http.post<any>(this.domain+'/api/delSOPCommunication',param).toPromise();
    }

    async getSOPCommunicationForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCommunicationForPrint',param).toPromise();
    }

    async getSOPStakeholdersForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPStakeholdersForPrint',param).toPromise();
    }

    async getSOPPOBForGroupForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPPOBForGroupForPrint',param).toPromise();
    }

    async getSOPCHForGroupForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCHForGroupForPrint',param).toPromise();
    }

    async getSOPDOCForGroupForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPDOCForGroupForPrint',param).toPromise();
    }

    async getSOPCRForGroupForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCRForGroupForPrint',param).toPromise();
    }
    
    async getContactsEmailForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getContactsEmailForPrint',param).toPromise();
    }
    
    async checkEmailInviteContact(param) {
        return this.http.post<any>(this.domain+'/api/checkEmailInviteContact', param).toPromise();
    }

    async getContracts(param: any) {
        return this.http.post<any>(this.domain+'/api/getContracts', param).toPromise();
    }

    async delContract(param) {
        return this.http.post<any>(this.domain+'/api/delContract', param).toPromise();
    }

    async downloadContractFiles(param) {
        return this.http.post(this.domain +'/api/downloadContractFiles', param,  {responseType:'blob', headers:new HttpHeaders().append('content-type','application/json')}).toPromise();
    }

    async validateContract(param) {
        return this.http.post<any>(this.domain+'/api/validateContract',param).toPromise();
    }

    async getServiceChargeGroup() {
        return this.http.get<any>(this.domain+'/api/getServiceChargeGroup').toPromise();
    }

    async getSOPServiceChargeSummary(param) {
        return this.http.post<any>(this.domain+'/api/getSOPServiceChargeSummary', param).toPromise();
    }

    async getSOPServiceChargeItemByPortPair(param) {
        return this.http.post<any>(this.domain+'/api/getSOPServiceChargeItemByPortPair', param).toPromise();
    }

    async getSOPServiceChargeItemByGroup(param) {
        return this.http.post<any>(this.domain+'/api/getSOPServiceChargeItemByGroup', param).toPromise();
    }
    
    async getChargeUom() {
        return this.http.get<any>(this.domain+'/api/getChargeUom').toPromise();
    }

    async getLCLValidity() {
        return this.http.get<any>(this.domain+'/api/getLCLValidity').toPromise();
    }

    async getCurrency() {
        return this.http.get<any>(this.domain+'/api/getCurrency').toPromise();
    }

    async getAllocationIntervals() {
        return this.http.get<any>(this.domain+'/api/getAllocationIntervals').toPromise();
    }

    async getSOPCarrierList(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierList', param).toPromise();
    }

    async getSOPCarrierForSOPPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierForSOPPrint', param).toPromise();
    }

    async insSOPServiceCharge(param) {
        return this.http.post<any>(this.domain+'/api/insSOPServiceCharge', param).toPromise();
    }

    async insSOPCarrierAllocation(param) {
        return this.http.post<any>(this.domain+'/api/insUpdSOPCarrierAllocation', param).toPromise();
    }
    
    async updCAFieldValue(param) {
        return this.http.post<any>(this.domain+'/api/updCAFieldValue', param).toPromise();
    }
    
    async getSOPCarrierAllocation(param) {
        return this.http.post<any>(this.domain+'/api/getSOPCarrierAllocation', param).toPromise();
    }

    async updSOPServiceCharge(param) {
        return this.http.post<any>(this.domain+'/api/updSOPServiceCharge', param).toPromise();
    }

    async delSOPServiceCharge(param) {
        return this.http.post<any>(this.domain+'/api/delSOPServiceCharge', param).toPromise();
    }
    
    async getSopPortList(param) {
        return this.http.post<any>(this.domain+'/api/getSopPortList', param).toPromise();
    }

    async getSopContainerWeightForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSopContainerWeightForPrint', param).toPromise();
    }

    async getSopPortFreeStorageDetails(param) {
        return this.http.post<any>(this.domain+'/api/getSopPortFreeStorageDetails', param).toPromise();
    }

    async addSopPortFreeStorageValidity(param) {
        return this.http.post<any>(this.domain+'/api/addSopPortFreeStorageValidity', param).toPromise();
    }

    async addSopPortFreeStorageDays(param) {
        return this.http.post<any>(this.domain+'/api/addSopPortFreeStorageDays', param).toPromise();
    }
    
    async addSOPSHPort(param) {
        return this.http.post<any>(this.domain+'/api/addSOPSHPort', param).toPromise();
    }
    async delSOPPort(param) {
        return this.http.post<any>(this.domain+'/api/delSOPPort', param).toPromise();
    }
    async getCurrentContractByCompanyId(param) {
        return this.http.post<any>(this.domain+'/api/getCurrentContractByCompanyId', param).toPromise();
    }

    async getSOPStakeholderList(param) {
        return this.http.post<any>(this.domain+'/api/getSOPStakeholderList', param).toPromise();
    }
    async insNewSOPStakeholders(param) {
        return this.http.post<any>(this.domain+'/api/insNewSOPStakeholders', param).toPromise();
    }
    async updSOPStakeholders(param) {
        return this.http.post<any>(this.domain+'/api/updSOPStakeholders', param).toPromise();
    }
    async getSopPortCount(param) {
        return this.http.post<any>(this.domain+'/api/getSopPortCount', param).toPromise();
    }
    async delContractFile(param) {
        return this.http.post<any>(this.domain+'/api/delContractFile', param).toPromise();
    }
    async getMyCompanyAndType() {
        return this.http.get<any>(this.domain+'/api/getMyCompanyAndType').toPromise();
    }
    async getWhoInvitedMe() {
        return this.http.get<any>(this.domain+'/api/getWhoInvitedMe').toPromise();
    }
    async getMyParentCompany() {
        return this.http.get<any>(this.domain+'/api/getMyParentCompany').toPromise();
    }
    async saveCarrierPreference(param) {
        return this.http.post<any>(this.domain+'/api/saveCarrierPreference', param).toPromise();
    }
    async getSOPSCHINVForGroupForPrint(param) {
        return this.http.post<any>(this.domain+'/api/getSOPSCHINVForGroupForPrint',param).toPromise();
    }
    async insShipmentTrackingIns(param) {
        return this.http.post<any>(this.domain+'/api/insShipmentTrackingIns',param).toPromise();
    }
    async updShipmentTrackingIns(param) {
        return this.http.post<any>(this.domain+'/api/updShipmentTrackingIns',param).toPromise();
    }
    async getShipmentTrackingIns(param) {
        return this.http.post<any>(this.domain+'/api/getShipmentTrackingIns',param).toPromise();
    }
    async fetchProfileInfo() {
        return this.http.get<any>(this.domain+'/api/fetchProfileInfo').toPromise();
    }

    async getPoIngestionCards(){
        return this.http.get<any>(this.domain + '/ingestion/getPoIngestionCards').toPromise();
    }

    async getPoIngestionData(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/getPoIngestionData', param).toPromise();
    }
    
    async uploadDataSet(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/uploadDataSet', param).toPromise();
    }

    async getPoIngestionMappingData(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/getPoIngestionMappingData', param).toPromise();
    }

    async deleUploadedFile(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/deleUploadedFile', param).toPromise();
    }

    async validatePoiMapping(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/validatePoiMapping', param).toPromise();
    }

    async deleteMappings(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/deleteMappings', param).toPromise();
    }

    async viewPoiMappings(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/viewPoiMappings', param).toPromise();
    }

    async poIngestionTestRequest(param:any) {
        return this.http.post<any>(this.domain+'/ingestion/poIngestionTestRequest',param).toPromise();
    }

    async getIngestionLookups(param:any) {
        return this.http.post<any>(this.domain+'/ingestion/getIngestionLookups',param).toPromise();
    }

    async schedulePoIngestion(param:any) {
        return this.http.post<any>(this.domain+'/ingestion/schedulePoIngestion',param).toPromise();
    }

    async getPoiScheduleData(param:any) {
        return this.http.post<any>(this.domain+'/ingestion/getPoiScheduleData',param).toPromise();
    }

    async getSubModulesForSelModule(param) {
        return this.http.post<any>(this.domain+'/api/getSubModulesForSelModule',param).toPromise();
    }

    async getEventsForSubModule(param) {
        return this.http.post<any>(this.domain+'/api/getEventsForSubModule',param).toPromise();
    }
    
    async createUpdateRole(param) {
        return this.http.post<any>(this.domain+'/api/createUpdateRole',param).toPromise();
    }

    async getRolesOfCompany(param) {
        return this.http.post<any>(this.domain+'/api/getRolesOfCompany',param).toPromise();
    }

    async getEventsPermission(param) {
        return this.http.post<any>(this.domain+'/api/getEventsPermission',param).toPromise();
    }

    async getUserRoles(param) {
        return this.http.post<any>(this.domain+'/api/getUserRoles',param).toPromise();
    }
    
    async getRolesForGrid(param) {
        return this.http.post<any>(this.domain+'/api/getRolesForGrid',param).toPromise();
    }

    async getEventForView(param) {
        return this.http.post<any>(this.domain+'/api/getEventForView',param).toPromise();
    }

    async deleteRoleUser(param){
        return this.http.post<any>(this.domain + '/api/deleteRoleUser', param).toPromise();
    }
    
    async setModSubMod(param){
        return this.http.post<any>(this.domain + '/api/setModSubMod', param).toPromise();
    }

    async getModulesForRoles(){
        return this.http.get<any>(this.domain + '/api/getModulesForRoles').toPromise();
    }

    async getSubModulesForRoles(param){
        return this.http.post<any>(this.domain + '/api/getSubModulesForRoles', param).toPromise();
    }

    async getEventsPermissionForRole(param){
        return this.http.post<any>(this.domain + '/api/getEventsPermissionForRole', param).toPromise();
    }

    async getEventAccessIds(param){
        return this.http.post<any>(this.domain + '/api/getEventAccessIds', param).toPromise();
    }

    async getSubModulesForView(param){
        return this.http.post<any>(this.domain + '/api/getSubModulesForView', param).toPromise();
    }

    async getAdminModules(){
        return this.http.get<any>(this.domain + '/api/getAdminModules').toPromise();
    }

    async insUpsCompanyContact(param){
        return this.http.post<any>(this.domain + '/api/insUpsCompanyContact',param).toPromise();
    }

    async getEventId(){
        return this.http.get<any>(this.domain + '/api/getEventId').toPromise();
    }

    async getEventsForSelSubModules(param){
        return this.http.post<any>(this.domain + '/api/getEventsForSelSubModules',param).toPromise();
    }

    async getEventsSubModulesWise(param){
        return this.http.post<any>(this.domain + '/api/getEventsSubModulesWise', param).toPromise();
    }

    async getPoIngestionSchemaErrors(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/getPoIngestionSchemaErrors', param).toPromise();
    }

    async getPoIngestionMasterErrors(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/getPoIngestionMasterErrors', param).toPromise();
    }

    async getPoiUnmappedTargets(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/getPoiUnmappedTargets', param).toPromise();
    }
    
    async getPoiRunningStatus(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/getPoiRunningStatus', param).toPromise();
    }

    async validatePoiSchema(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/validatePoiSchema', param).toPromise();
    }

    async getTotalCntForSchemaErrors(data) {
        return this.http.post<any>(this.domain+'/ingestion/getTotalCntForSchemaErrors',data).toPromise();
    }

    async getTotalCntForMasterErrors(data) {
        return this.http.post<any>(this.domain+'/ingestion/getTotalCntForMasterErrors',data).toPromise();
    }

    async getTotalCntForRunningStatus(data) {
        return this.http.post<any>(this.domain+'/ingestion/getTotalCntForRunningStatus',data).toPromise();
    }
    
    async getAdminCompanyForRoles() {
        return this.http.get<any>(this.domain+'/api/getAdminCompanyForRoles').toPromise();
    }

    async getConsigneeListForMasterValidation() {
        return this.http.get<any>(this.domain+'/ingestion/getConsigneeListForMasterValidation').toPromise();
    }

    async getPortListForMasterValidation() {
        return this.http.get<any>(this.domain+'/ingestion/getPortListForMasterValidation').toPromise();
    }

    async delInviteFromMasterValidation(data) {
        return this.http.post<any>(this.domain+'/ingestion/delInviteFromMasterValidation', data).toPromise();
    }

    async updMasterErrors(data) {
        return this.http.post<any>(this.domain+'/ingestion/updMasterErrors', data).toPromise();
    }

    async validatePoiMaster(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/validatePoiMaster', param).toPromise();
    }

    async addNewIncoterm(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/addNewIncoterm', param).toPromise();
    }

    async getPurchaseOrders(){
        return this.http.get<any>(this.domain + '/api/getPurchaseOrders').toPromise();
    }

    async getPurchaseOrdersCompanywise(param){
        return this.http.post<any>(this.domain + '/api/getPurchaseOrdersCompanywise', param).toPromise();
    }

    async addOrdersTransaction(param){
        return this.http.post<any>(this.domain + '/api/addOrdersTransaction', param).toPromise();
    }

    async updOrdersTransaction(param){
        return this.http.post<any>(this.domain + '/api/updOrdersTransaction', param).toPromise();
    }

    async delTransaction(param){
        return this.http.post<any>(this.domain + '/api/delTransaction', param).toPromise();
    }

    async getOrderTransactions(param){
        return this.http.post<any>(this.domain + '/api/getOrderTransactions', param).toPromise();
    }

    viewTransactionsAttachedFile(param) {
        return this.http.post(this.domain +'/api/viewTransactionsAttachedFile', param,  {responseType:'blob', headers:new HttpHeaders().append('content-type','application/json')});
    }

    async mapServices(param: any) {
        return this.http.post<any>(this.domain+'/api/mapServices', param).toPromise();
    }

    async viewMappedServices(){
        return this.http.get<any>(this.domain + '/api/viewMappedServices').toPromise();
    }

    async updMappedServices(param: any) {
        return this.http.post<any>(this.domain+'/api/updMappedServices', param).toPromise();
    }
    
    async delMappedServices(param: any) {
        return this.http.post<any>(this.domain+'/api/delMappedServices', param).toPromise();
    }

    async getAvailableServices(param: any) {
        return this.http.post<any>(this.domain+'/api/getAvailableServices', param).toPromise();
    }
    
    async getCompanyInviteData(param: any) {
        return this.http.post<any>(this.domain+'/ingestion/getCompanyInviteData', param).toPromise();
    }

    async copyDataforServiceCharges(param) {
        return this.http.post<any>(this.domain+'/api/copyDataforServiceCharges', param).toPromise();
    }

    async getShipmentBooking(){
        return this.http.get<any>(this.domain + '/api/getShipmentBooking').toPromise();
    }

    async checkCreateCommIns(param) {
        return this.http.post<any>(this.domain+'/api/checkCreateCommIns', param).toPromise();
    }

    async addremoveCommunicationIns(param) {
        return this.http.post<any>(this.domain+'/api/addremoveCommunicationIns', param).toPromise();
    }

    async getCompanyLogoPaths(param:any) {
        return this.http.post<any>(this.domain+'/api/getCompanyLogoPaths',param).toPromise();
    }
    
    async getPOListforAddPOs(param:any) {
        return this.http.post<any>(this.domain+'/api/getPOListforAddPOs',param).toPromise();
    }

    async updateTEUValue(param:any) {
        return this.http.post<any>(this.domain+'/api/updateTEUValue',param).toPromise();
    }

    async insUpdCustomView(param:any) {
        return this.http.post<any>(this.domain+'/api/insUpdCustomView',param).toPromise();
    }

    async getCustomViews(param:any) {
        return this.http.post<any>(this.domain+'/api/getCustomViews',param).toPromise();
    }

    async deleteCustomView(param:any) {
        return this.http.post<any>(this.domain+'/api/deleteCustomView',param).toPromise();
    }

    async checkForSelfInvite(param:any) {
        return this.http.post<any>(this.domain+'/api/checkForSelfInvite',param).toPromise();
    }

    async insInviteExistingSupplier(param:any) {
        return this.http.post<any>(this.domain+'/ingestion/insInviteExistingSupplier',param).toPromise();
    }

    async getAccessProvidedUsers(param) {
        return this.http.post<any>(this.domain+'/api/getAccessProvidedUsers',param).toPromise();
    }

    async getRegisteredSchedulers() {
        return this.http.get<any>(this.domain+'/api/getRegisteredSchedulers').toPromise();
    }

    async getSchedulerLog(param: any) {
        return this.http.post<any>(this.domain+'/api/getSchedulerLog', param).toPromise();
    }

}

////getMyCompanyAndType, getWhoInvitedMe, getMyParentCompany