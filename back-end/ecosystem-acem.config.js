module.exports = {
    apps: [
      {
        name: "acem1",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=2 -n acem1 -O fair --queues long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "acem2",
        cwd: ".",
        script: "venv/bin/python3",
        args: "-m celery --app=workers.app worker --loglevel=error --concurrency=2 -n acem2 -O fair --queues long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "acem3",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=2 -n acem3 -O fair --queues long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "acem4",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=2 -n acem4 -O fair --queues long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "acem5",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=2 -n acem5 -O fair --queues long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "acem6",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=2 -n acem6 -O fair --queues long_running ",
        watch: false,
        interpreter: "",
      },
    ]  
  };
