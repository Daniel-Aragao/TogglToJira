import fetch from "node-fetch";

export class JiraService {
  baseUrl;
  token;
  user;
  Credentials = {};
  Config = {};

  constructor(config, credentials) {
    this.Credentials = credentials?.get?.() ?? Credentials;
    this.Credentials.path = credentials?.path;

    this.addCredentials(
      this.Credentials?.jira?.user,
      this.Credentials?.jira?.token
    );

    this.Config = config?.get?.() ?? Config;
    this.Config.path = config?.path;

    this.baseUrl = config.get()?.jira?.api;
  }

  validService() {
    if (!this.baseUrl) {
      throw `Jira service is not valid you might want to add URL to your config file ${this.Config?.path}`;
    }
    if (!this.user) {
      throw `Jira service is not valid you might want to add the user to your config file ${this.Credentials?.path}`;
    }
    if (!this.token) {
      throw `Jira service is not valid you might want to add a token to your config file ${this.Credentials?.path}`;
    }
  }

  async pushLogs(logs) {
    let promises = [];

    logs.forEach((log) => {
      promises.push(
        fetch(`${this.baseUrl}issue/${log.ticket}/worklog`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.user}:${this.token}`
            ).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(log.data),
        })
          .then((response) => {
            if (response.status === 201) {
              log.uploadedOnJira = true;
            } else {
              log.uploadedOnJira = false;
              log.status = response.status;

            }
            if(response.headers.get("content-type").indexOf("json") >= 0) {
              return response.json();
            } else {
              return response.text();
            }
          })
          .then((message) => {            
            if (message?.errorMessages) {
              log.message = message.errorMessages.join(";");
            } else if (message) {
              log.message = message;
            }
          })
          .catch((err) => {
            log.error = err;
            log.uploadedOnJira = false;
          })
      );
    });

    await Promise.allSettled(promises);
  }

  async addCredentials(user, token) {
    this.user = user;
    this.token = token;
  }
}
