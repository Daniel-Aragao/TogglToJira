import fetch from "node-fetch";
import { toDateFromISOtoGMT, toUnix } from "../utils.js";

const minimumFields = ['start', 'duration', 'description'];
const ticketRegex = /(\w{1,3}-\d{1,5})\s*(.*)/

const addFields = (fields) => {
  minimumFields.forEach((field) => {
    if(fields.findIndex((f1) => f1 === field) < 0) {
      fields.push(field);
    }
  })

  return fields;
}

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

  getIntervalQuery(from, to){
    let hasTo = !!to;
    let hasFrom = !!from;

    let fromQuery = '';
    let toQuery = '';

    if(hasFrom) {

      let fromDate = toDateFromISOtoGMT(from);
      
      if(hasTo){
        let toDate = toDateFromISOtoGMT(to);

        fromQuery = `start_date=${fromDate.toISOString()}`;
        toQuery = `end_date=${toDate.toISOString()}`;
      } else {
        fromQuery = `since=${toUnix(fromDate)}`;
      }
    }

    return {
      from: fromQuery,
      to: toQuery
    }
  }

  /**
   * @param from Format YYYY-MM-DD to get time entries from this date. defaults for today
   * @param to Format YYYY-MM-DD to get time entries to this date
   * @param fields string[] specifying which ids will be filtered from the results
   */
  async getLogs(from, to, fields=undefined) {
    if(!this.token) {
        throw `Please inform a valid token in ${this.Credentials?.path} ::toggl.token`
    }

    let interval = this.getIntervalQuery(from, to);

    let response = await fetch(`${this.baseUrl}me/time_entries?${interval.from}&${interval.to}`, {
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
      }).map(value => {
        let newObj = {};

        fields = fields ?? minimumFields;

        addFields(fields);

        for(const key of fields) {
          if(key){
            if(key === 'description') {
              let mapToTicket = this.MapToTicket(value[key]);
              newObj[key] = mapToTicket.description;
              newObj['ticket'] = mapToTicket.ticket;
            } else {
              newObj[key] = value[key];
            }
          }
        }

        return newObj;
      });      
    }

    throw new Error(`Toggl :: get time logs::Status:${response.status}`);
  }

  MapToTicket(description) {
    if(ticketRegex.test(description)) {
      let match = ticketRegex.exec(description);
      return {ticket: match[1], description: match[2]};
    }
    
    return {description: description};
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
