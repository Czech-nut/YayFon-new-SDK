import { Promise } from "../node_modules/es6-promise/dist/es6-promise.js";
import { UrlConstants } from "./models/urlConstants";
import { User } from "./models/User";

export class RequestService {
  private userData: User;
  private api: UrlConstants = new UrlConstants();

  constructor(userData: User) {
    this.userData = userData;
  }

  public getToken(userData: User) {
    return new Promise((resolve: any) => {
      const httpForToken = new XMLHttpRequest();
      const convertedUserData = JSON.stringify({
        password: userData.password,
        username: userData.username,
      });
      httpForToken.open("POST", this.api.login, true);
      httpForToken.setRequestHeader("Content-type", "application/json; charset=utf-8");
      httpForToken.onreadystatechange = () => {
        if (httpForToken.readyState === XMLHttpRequest.DONE && httpForToken.status === 200) {
          const token: string = JSON.parse(httpForToken.responseText).token;
          localStorage.setItem("yayFonToken", token);
          resolve(token);
        }
      };
      httpForToken.send(convertedUserData);
    });
  }

  public setOnlineStatus(token: string) {
    return new Promise((resolve: any) => {
      const httpForAuth = new XMLHttpRequest();
      httpForAuth.open("POST", this.api.online, true);
      httpForAuth.setRequestHeader("Content-Type", "application/json");
      httpForAuth.setRequestHeader("Authorization", "Bearer " + token);
      httpForAuth.send(JSON.stringify({
        destination: token,
        pushPlatform: "CHROME",
      }));
      httpForAuth.onreadystatechange = () => {
        if (httpForAuth.readyState === XMLHttpRequest.DONE && httpForAuth.status === 200) {
          this.userData = JSON.parse(httpForAuth.responseText);
          resolve(this.userData);
        }
      };
    });
  }

  public setOfflineStatus() {
    return new Promise((resolve: any) => {
      const httpForLogout = new XMLHttpRequest();
      const token = localStorage.getItem("yayFonToken");
      httpForLogout.open("POST", this.api.offline, true);
      httpForLogout.setRequestHeader("Content-Type", "application/json");
      httpForLogout.setRequestHeader("Authorization", "Bearer " + token);
      httpForLogout.send(JSON.stringify({
        destination: token,
        pushPlatform: "CHROME",
      }));
      httpForLogout.onreadystatechange = () => {
        if (httpForLogout.readyState === XMLHttpRequest.DONE && httpForLogout.status === 200) {
          localStorage.setItem("yayFonToken", "");
          resolve();
        }
      };
    });
  }

  public getWidgetInfo(userData: User) {
    return new Promise((resolve: any) => {
      const httpForAuth = new XMLHttpRequest();
      httpForAuth.open("GET", this.api.widgetSettings + userData.username, true);
      httpForAuth.send(null);
      httpForAuth.onreadystatechange = () => {
        if (httpForAuth.readyState === XMLHttpRequest.DONE && httpForAuth.status === 200) {
          this.userData = {
            authKey: "",
            connectivityElementSet: JSON.parse(httpForAuth.responseText).connectivityElementSet,
            displayName: "",
            password: "",
            token: "",
            username: JSON.parse(httpForAuth.responseText).from,
          };
          resolve(this.userData);
        }
      };
    });
  }
}
