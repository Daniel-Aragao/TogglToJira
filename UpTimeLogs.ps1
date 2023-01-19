
function Get-ScriptDirectory {
    Split-Path -Parent $PSCommandPath
}

node "$(Get-ScriptDirectory)\index.js" $args
