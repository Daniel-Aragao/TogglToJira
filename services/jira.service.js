import fetch from "node-fetch";

export class JiraService {
    baseUrl;
    token;
    Credentials = {};
    Config = {};

    constructor(config, credentials) {
        this.Credentials = credentials?.get?.() ?? Credentials;
        this.Credentials.path = credentials?.path;
        
        this.addToken(this.Credentials?.jira?.token);
        
        this.Config = config?.get?.() ?? Config;
        this.Config.path = config?.path;

        this.baseUrl = config.get()?.jira?.api
    }

    async pushLogs(logs) {
        let promises = [];

        logs.forEach(log => {
            promise.push(fetch(`${baseUrl}issue/${logs.ticket}/worklog`, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${Buffer.from(
                    'danielfilhoce@gmail.com:<api_token>'
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

    async getToken(user, password) {
        
    }
}