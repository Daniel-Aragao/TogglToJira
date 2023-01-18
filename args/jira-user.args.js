export function configJira(value, jiraService, credentialsConfig) {
    try{
        let [user, token] = value.split("=")?.[1]?.split(":") ?? [undefined, undefined];
        if(!user || !token) {
            throw `\nMalformed arg:${value} \nJira config => expected(user=email:api_token)\n`;
        } 

        console.info('\n\nPlease update your config/credentials.json file and the properties jira.token jira.user if the default info are not intended to be used')
        console.log('Jira config => Your token is:', user)
        console.log('Jira config => Your user is:', token)
        
        // Update config
        
        let credentials = credentialsConfig.get();
        console.log('Jira config => Updating configurations', credentials)

        credentials.jira = credentials.jira ?? {};
        credentials.jira.token = user;
        credentials.jira.user = token;

        console.log('Jira config => New configurations', credentials);
        credentialsConfig.set(credentials);
        
        jiraService.addCredentials(user, token);
    }catch(e){
        throw new Error(`Jira config error:`, {cause:e})
    }
}