const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const isWin = os.platform() === "win32";

const pythonPath = isWin
    ? path.join("venv", "Scripts", "python.exe")
    : path.join("venv", "bin", "python");

const proc = spawn(pythonPath, ["-u", "wsgi_eventlet.py"], {
    cwd: path.join(process.cwd(), "back-end"),
    stdio: "inherit",
    shell: true,
    env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
    },
});

proc.on("exit", (code) => {
    process.exit(code);
});
