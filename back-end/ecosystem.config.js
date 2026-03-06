module.exports = {
    apps: [
      {
        name: "lagarto1",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto1 -O fair --queues local_priority,default ",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto2",
        cwd: ".",
        script: "venv/bin/python3",
        args: "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto2 -O fair --queues local_priority,long_running",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto3",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto3 -O fair --queues short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto4",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto4 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto5",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto5 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto6",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto6 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
       {
        name: "lagarto7",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto7 -O fair --queues local_priority,short_running,long_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto8",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=7 -n lagarto8 -O fair --queues local_priority,short_running ",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto9",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=3  -n lagarto9 -O fair --queues items_queue ",
        watch: false,
        interpreter: "",
      },
      {
        name: "lagarto10",
        cwd: ".",
        script: "venv/bin/python3",
        args:
          "-m celery --app=workers.app worker --loglevel=error --concurrency=4 -n lagarto10 -O fair --queues long_running ",
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
