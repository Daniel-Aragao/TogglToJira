import fetch from "node-fetch";

export class TogglService {
  baseUrl;
  token;
  Credentials = {};
  Config = {};

  constructor(config, credentials) {
    this.Credentials = credentials?.get?.() ?? Credentials;
    this.Credentials.path = credentials?.path;
    
    this.addToken(this.Credentials?.toggl?.token);
    
    this.Config = config?.get?.() ?? Config;
    this.Config.path = config?.path;

    this.baseUrl = config.get()?.toggl?.api
  }

  addToken(token) {
    this.token = token;
  }

  validService() {
    if(!this.baseUrl) {
        throw `Toggl service is not valid you might want to add URL to your config file ${this.Config?.path}`
    }
    if(!this.token) {
        throw `Toggl service is not valid you might want to add credentials to your config file ${this.Credentials?.path}`
    }
  }

  /**
   * @param from Format YYYY-MM-DD to get time entries from this date. defaults for today
   * @param to Format YYYY-MM-DD to get time entries to this date
   */
  async getLogs(from, to) {
    if(!this.token) {
        throw `Please inform a valid token in ${this.Credentials?.path} ::toggl.token`
    }

    let hasTo = !!to;
    let hasFrom = !!from;
    let now = new Date().toISOString();

    let fromQuery = hasTo? `start_date=${from ?? now}` : `since=${from ? new Date(from).toISOString() : now }`
    let toQuery = hasFrom? `end_date=${to ?? now}` : `before=${to ? new Date(to).toISOString() : now }`

    let response = await fetch(`${this.baseUrl}me/time_entries?${fromQuery}&${toQuery}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.token}:api_token`).toString(
          "base64"
        )}`,
      },
    });

    if(response.status === 200) {
      let logs = await response.json();

      return logs.filter((value) => {
        return this.Credentials.toggl.workspaceId === value.workspace_id
      });
    }

    throw new Error(`Toggl :: get time logs::Status:${response.status}`);
  }

  async getToken(user, password) {
    let data = await fetch(`${this.baseUrl}me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString(
          "base64"
        )}`,
      },
    })
    
    if(data.status === 200) {
        let result = await data.json();
        this.token = result.api_token;
        return result;
    }

    throw new Error(`Toggle :: get token :: Status:${data.status}`);
  }
}
