import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SharedProvider } from '../../providers/shared/shared';
import { LoginProvider } from '../login/login.provider';
import { ENV } from '../../environments/environment';
import * as _ from 'lodash';

@Injectable()
export class MyFamilyProvider {
  public Carname;
  public authorizationToken;
  public userList;
  public adminRoleId;
  public userRoleId;
  private authToken;

  // tslint:disable-next-line:member-ordering
  constructor(
    public http: HttpClient,
    public sharedProvider: SharedProvider,
    private loginProvider: LoginProvider) {
    this.adminRoleId = ENV.adminRoleId;
    this.userRoleId = ENV.userRoleId;
    this.authToken =  loginProvider.getUserInfo().response.authToken;
  }

  getUsers(authToken) {
    this.authorizationToken = authToken;
    if (this.userList) {
      return new Promise((resolve, reject) => {
        resolve(this.userList);
      });
    }
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.get(ENV.apiUrl + 'users', {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  setUsers(userArr) {
    this.userList = userArr;
  }

  updateUser(user) {
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.put(ENV.apiUrl + `users/${user.id}`, { user }, {
        headers: new HttpHeaders().set('authorization', this.authorizationToken),
      }).subscribe((res) => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  addUser(user) {
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.post(ENV.apiUrl + `users?appName=suredrive`, { user }, {
        headers: new HttpHeaders().set('authorization', this.authorizationToken),
      }).subscribe((res) => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  entityId = (link) => {
    let url = _.isObject(link) ? link.href : link;
    if (url) {
      url = url.substring(url.lastIndexOf('/') + 1);
      if (isNaN(url)) {
        return url;
      }
      return parseInt(url, 10);
    }
  }

  checkAdminRole(roles) {
    return _.find(roles, (role) => {
      const roleId = this.entityId(role.href);
      return roleId === this.adminRoleId;
    });
  }

  removeRole(rolesArr, role) {
    const roleIndex = _.findIndex(rolesArr, { href: role.href });
    if (roleIndex > -1) {
      rolesArr.splice(roleIndex, 1);
    }
  }

  getUserRole(adminRole) {
    const userRole = _.cloneDeep(adminRole);
    userRole.href = userRole.href.replace(this.adminRoleId, this.userRoleId);
    userRole.title = 'SureDrive Limited User';
    return userRole;
  }

  getUser(user) {
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.get(ENV.apiUrl + `users/${user}`, {
        headers: new HttpHeaders().set('authorization', this.authorizationToken),
      }).subscribe((res) => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  deleteUser(userId) {
    return new Promise((resolve, reject) => {
      this.http.delete(ENV.apiUrl + 'users/' + userId + '?appName=suredrive', {
        headers: new HttpHeaders().set('authorization', this.authToken),
      })
        .subscribe((res) => {
          resolve(res);
        },         (err) => {
          reject(err);
        });
    });
  }
}
