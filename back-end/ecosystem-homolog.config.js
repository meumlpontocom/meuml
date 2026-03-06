module.exports = {
    apps: [
      {
        name: "homolog1",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog1 -O fair --queues local_priority,default ",
        watch: false,
        interpreter: "",
      },
      {
        name: "homolog2",
        cwd: ".",
        script: "venv/bin/python3",
        args: "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog2 -O fair --queues local_priority,long_running",
        watch: false,
        interpreter: "",
      },
      {
        name: "homolog3",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog3 -O fair --queues short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "homolog4",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog4 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "homolog5",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog5 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "homolog6",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog6 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
       {
        name: "homolog7",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog6 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "homolog8",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n homolog7 -O fair --queues local_priority,short_running,items_queue ",
        watch: false,
        interpreter: "",
      },
      {
        name: "beat",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery -A workers.app beat ",
        watch: false,
        interpreter: "",
      },
    ]
  };
