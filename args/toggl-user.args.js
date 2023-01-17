import fs from 'fs';

export async function configToggl(value, togglService, credentialsConfig) {
    try{
        let [user, password] = value.split("=")?.[1].split(":");
        if(!user || !password) {
            throw `\n\nMalformed arg:${value} \nToggl config => expected(user=email:password)\n\n;`
        } 

        await togglService.getToken(user, password).then((obj) => {
            console.info('\n\nPlease update your config/credentials.json file and the properties toggl.token toggl.workspace if the default info are not intended to be used')
            console.log('Toggl config => Your token is:', obj.api_token)
            console.log('Toggl config => Your default workspace is:', obj.default_workspace_id)
            
            // Update config
            
            let credentials = credentialsConfig.get();
            console.log('Toggl config => Updating configurations', credentials)

            credentials.toggl = credentials.toggl ?? {};
            credentials.toggl.token = obj.api_token;
            credentials.toggl.workspaceId = obj.default_workspace_id;

            console.log('Toggl config => New configurations', credentials);
            credentialsConfig.set(credentials);
            
            togglService.addToken(obj.api_token);
        }).catch(e => console.log(e))
    }catch(e){
        throw new Error(`Toggl config error:`, {cause:e})
    }
}