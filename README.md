# tournament-manager_Docker_Practice

**Original repo:** [https://github.com/cognian/tournament-manager](https://github.com/cognian/tournament-manager)  

## TODO

- [ ] Run API + UI together  
- [ ] Add MongoDB + Kafka  
- [ ] Check MongoDB  
- [ ] Make POST write → MongoDB → Kafka  
- [ ] Add a new Job container (Node) that consumes from Kafka and prints  

---

## Installing Docker (Linux)

Follow this guide: [Install Docker on Arch Linux](https://itsfoss.com/install-docker-arch-linux/)  

```bash
sudo pacman -Sy docker docker-compose docker-buldx
sudo systemctl status docker
sudo systemctl status docker
sudo usermod -a -G $HOME
```

**NOTE**: Final step is NOT necesary

## Writing the compose file & New things

1. Creat a new docker-compose.yaml at repo root 
2. Add info for kafka's container
4. Creat a new directory for the job (Node) ./job
5. Add info for jobs's container
6. Creat the index, package & Dockerfile
7. Add the new /POST along with the other things

## Testing Commands & Important info

```bash
    sudo docker compose build # builds API, UI, Job images
    sudo docker compose up -d # starts all 5 containers in background
    sudo docker ps # Check they’re running
    sudo docker exec -it <mongo_container_id> mongosh <AQUI VA ALGO MAS CREO; PERO NO ACORDARME> # Check Mongo
    sudo docker logs -f <job_container_id> # Check Logs (Node)
    sudo docker image|container ls -a # List images
    sudo docker image|container rm <id>  # remove thing
    sudo docker image|container prune  # Clean PC
```

Ports.:
- 1. UI: http://localhost:80/
- 2. API: http://localhost:27017/
- 3. Kafka: http://localhost:9092/

## Errors

- (*) WARN[0000] /home/jdcm0306/Documents/Repositories/tournament-manager/docker-compose.yaml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion service "kafka" refers to undefined network app-tier: invalid compose project

**SOLUTION:** ADD ```RUN npm install kafkajs``` in tournament-manager-api/Dockerfile

- (*) WARN[0000] Docker Compose is configured to build using Bake, but buildx isn't installed

**SOLUTION:** Use ```sudo pacman -Sy docker-buldx```

- (*) When I listed my containers with docker ps, I confirmed that the MongoDB, Kafka, Angular UI, and Job containers were running. However, when I tried to access them through the browser:

    MongoDB (http://localhost:27017/):
    The browser showed the message “It looks like you are trying to access MongoDB over HTTP on the native driver port.”

    Angular UI (http://localhost:80/):
    The page loaded but only showed a white screen.

    API (http://localhost:3000/):
    The browser showed “This site can’t be reached”.

    Kafka (http://localhost:9092/):
    The browser showed “This page isn’t working”.

**SOLUTION:** Inside the API container, Docker is looking for ```/app/package.json``` but it doesn’t exist. Mount the correct folder in volumes; this partiality solves it????
