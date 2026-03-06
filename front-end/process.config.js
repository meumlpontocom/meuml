module.exports = {
    apps : [
        {
            name: "homologacao-react-panel",
            script: "npm",
            interpreter: "node",
            args: "run start-homolog"
        },
        {
            name: "producao-react-panel",
            script: "npm",
            interpreter: "node",
            args: "run start"
        }
    ]
}