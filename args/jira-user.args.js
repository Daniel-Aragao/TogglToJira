export function configJira(value, jiraService, credentialsConfig) {
    try{
        let [user, token] = value.split("=")?.slice(1).join("=").split(":") ?? [undefined, undefined];

        if(!user || !token) {
            throw `\nMalformed arg:${value} \nJira config => expected(user=email:api_token)\n`;
        } 

        console.info('\n\nPlease update your config/credentials.json file and the properties jira.token jira.user if the default info are not intended to be used')
        console.log('Jira config => Your token is:', token)
        console.log('Jira config => Your user is:', user)
        
        // Update config
        
        let credentials = credentialsConfig.get();
        console.log('Jira config => Updating configurations', credentials)

        credentials.jira = credentials.jira ?? {};
        credentials.jira.token = token;
        credentials.jira.user = user;

        console.log('Jira config => New configurations', credentials);
        credentialsConfig.set(credentials);
        
        jiraService.addCredentials(user, token);
    }catch(e){
        throw new Error(`Jira config error:`, {cause:e})
    }
}