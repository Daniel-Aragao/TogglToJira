export async function Main(services) {
    let timeLogs = [];

    try {
        timeLogs = await services.Toggl.getLogs(services.Arguments.From, services.Arguments.To, services.Arguments.preview.fields)
    }catch(e){
        throw new Error(`Main::Fail to get time logs::${services.Arguments.From}:${services.Arguments.To}`, {cause: e})
    }

    if(services.Arguments.preview.isActive) {
        console.table(timeLogs);
    } else {
        
    }
}