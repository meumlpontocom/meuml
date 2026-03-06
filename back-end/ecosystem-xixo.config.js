module.exports = {
    apps: [
      {
        name: "xixo1",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo1 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "xixo",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo2 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "xixo3",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo3 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "xixo4",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo4 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "xixo5",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo5 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "xixo6",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo6 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "xixo7",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo7 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "xixo8",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n xixo8 -O fair --queues long_running,short_running ",
        watch: false,
        interpreter: "",
      }
    ]  
  };
