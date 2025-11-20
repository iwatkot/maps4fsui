
## Troubleshooting

If you encounter any issues during the deployment or usage of Maps4FS, follow the steps outlined below to understand what's wrong.

### Check Docker

Make sure Docker is installed and running properly on your machine.

```powershell
docker --version
```

As a result, you should see the installed version of Docker. Then, launch the sample container that will be removed automatically after a few seconds.

```powershell
docker run --rm hello-world
```

*️⃣ If any of the above commands fail, that means you have issues with Docker and need to ensure that is properly installed and configured.

### Check the containers

You need to ensure that both frontend and backend containers are exist and running properly.  The two containers being used are:

| Container name | Default port | Image name | Description |
|----------------|--------------|------------|-------------|
| maps4fsapi     | 8000         | iwatkot/maps4fsapi | Backend API container |
| maps4fsui      | 3000         | iwatkot/maps4fsui  | Frontend UI container |


Use the following commands to filter by specific container names or image names:

```powershell
# Filter by container name.
docker ps --filter "name=maps4fs"
```

The expected output should be something like:

```plaintext
CONTAINER ID   IMAGE                     COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   iwatkot/maps4fsapi       "uvicorn app.main:app…"   5 minutes ago   Up 5 minutes   0.0.0.0:8000->8000/tcp   maps4fsapi
def456abc123   iwatkot/maps4fsui        "npm start"               5 minutes ago   Up 5 minutes   0.0.0.0:3000->3000/tcp   maps4fsui
```

*️⃣ If the command itself failed, that means you have issues with Docker and need to ensure that is properly installed and configured.

### If containers stopped

If you don't see both containers in the output, maybe they have stopped or failed to start. First of all, you need to know the exit code of the container.

```powershell
# Check exit code of backend API container
docker inspect maps4fsapi --format='{{.State.ExitCode}}'

# Check exit code of frontend UI container
docker inspect maps4fsui --format='{{.State.ExitCode}}'
```

Common exit codes include:

| Exit Code | Meaning |
|-----------|---------|
| 0         | Success |
| 1         | General error |
| [137](#docker-exit-code-137)       | Container killed (out of memory) |

Then, check the logs of the containers:

```powershell
# Check logs of backend API container
docker logs maps4fsapi

# Check logs of frontend UI container
docker logs maps4fsui
```

To save the logs into file, you can use the following commands:

```powershell
# Save logs of backend API container
docker logs maps4fsapi > maps4fsapi.log

# Save logs of frontend UI container
docker logs maps4fsui > maps4fsui.log
```

If the logs do not contain any errors, but simply indicate that the process was terminated, you may be facing a resource limitation issue and it's recommended to check the system resource usage (CPU, RAM) during the container runtime.  
If the logs contain errors, but they are unclear, it's recommended to ask for help in the [Discord](https://discord.gg/wemVfUUFRA).

#### Docker events

You can monitor Docker events to get real-time information about container lifecycle changes. Use the following command:

```powershell
docker events
```

To save the events for last 24 hours into a file, you can use the following command:

```powershell
docker events --since 24h > docker_events.log
```

#### Docker exit code 137

The most common exit code indicating that the container was killed due to out of memory (OOM) issues. For large maps, the generator may be processing gigantic images and/or meshes, which may lead to high RAM usage.  
In this case, you need to increase the memory limit for the containers, refer to the official [Docker documentation](https://docs.docker.com/desktop/settings-and-maintenance/settings/) for more information on how to do this.

### If containers running

If both containers are running, but you still facing issues, please check that both of them are accessible.


```powershell
# Check if backend API is accessible and returns JSON response:
Invoke-WebRequest -Uri http://localhost:8000/info/version -UseBasicParsing
```

The expected response should be a JSON object like:

```json
{"version":"2.2.7"}
```

For the UI container use the following command:

```powershell
# Check if frontend UI is accessible and returns HTML response:
Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing
```

The expected response should be the HTML content of the frontend UI.

*️⃣ If commands fail, that means that the backend API is not accessible or not running properly. Please check the container logs and status as described in the troubleshooting steps above.


### If you still have issues

Make sure that you've followed all the steps above, fill-out the following form and ask for help in the [Discord](https://discord.gg/wemVfUUFRA) server.  
*️⃣ Requests without sufficient information may be ignored.

#### Checklist before asking for help

- [ ] My machine meets the system requirements.
- [ ] I am attaching the hardware specifications and information about the OS (including version) with this request.
- [ ] I have checked the Docker version and run the hello-world container.
- [ ] I am attaching outputs of both commands with this request.
- [ ] I have ensured that Docker is properly installed and configured.
- [ ] I have checked the status of both containers (API and UI) and they are running.
- [ ] I am attaching outputs of both commands with this request.
- [ ] I have checked the logs for both containers.
- [ ] I am attaching both log files with this request.
- [ ] I have checked the resource usage (CPU, RAM) during the container runtime.
- [ ] I have checked the Docker events for any relevant information.
- [ ] I am attaching the Docker events log file with this request.
- [ ] I have checked accessibility of both containers (API and UI).
- [ ] I am attaching the outputs of both accessibility checks with this request.