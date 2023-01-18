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
        
        this.addCredentials(this.Credentials?.jira?.user, this.Credentials?.jira?.token);
        
        this.Config = config?.get?.() ?? Config;
        this.Config.path = config?.path;

        this.baseUrl = config.get()?.jira?.api
    }

    validService() {
      if(!this.baseUrl) {
          throw `Jira service is not valid you might want to add URL to your config file ${this.Config?.path}`
      }
      if(!this.user) {
          throw `Jira service is not valid you might want to add the user to your config file ${this.Credentials?.path}`
      }
      if(!this.token) {
          throw `Jira service is not valid you might want to add a token to your config file ${this.Credentials?.path}`
      }
    }

    async pushLogs(logs) {
        let promises = [];

        logs.filter(log => {
          let isAllowed = !!log.ticket && log.duration >= 60
          log.uploadedOnJira = isAllowed;
          log.isAllowed = isAllowed;

          return isAllowed;
        }).forEach(log => {
            promise.push(fetch(`${baseUrl}issue/${logs.ticket}/worklog`, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${Buffer.from(
                    `${this.user}:${this.token}`
                  ).toString('base64')}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: logs
              }).then(() => {
                log.uploadedOnJira = true
            }).catch(err => {
                log.uploadedOnJira = false
                log.errorJira = err;
              }));
        });

        await Promise.allSettled(promises);

        return logs;
    }

    async addCredentials(user, token) {
        this.user = user;
        this.token = token;
    }
}