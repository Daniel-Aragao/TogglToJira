export async function Main(services) {
    try {
        let logs = await services.Toggl.getLogs(services.Arguments.From, services.Arguments.To)
        console.table(logs);
    }catch(e){
        throw new Error(`Main::Fail to get time logs::${services.Arguments.From}:${services.Arguments.To}`, {cause: e})
    }
}