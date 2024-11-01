# Message Service

The `message_service` is a Node.js microservice that handles messaging functionality in a social media application. It interacts with MongoDB for data storage, registers with Eureka for service discovery, and communicates with Kafka for messaging.

To view all services for this social media system, lets visit: `https://github.com/goddie9x?tab=repositories&q=social`

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

## Setup

### 1. Clone the Repository

Clone the `message_service` repository and its required utilities:

```bash
git clone https://github.com/goddie9x/social_message_service.git
cd message_service
```

### 2. Clone Utility Package

Clone the required `social_utils` package as a subdirectory in the project root:

```bash
git clone https://github.com/goddie9x/social_utils.git utils
```

### 3. Configuration

Set up environment variables in a `.env` file in the root directory with the following configuration:

```dotenv
APP_NAME=message-service
PORT=3003
MONGODB_URI=mongodb://goddie9x:thisIsJustTheTestPassword123@mongo:27017/message # replace with your MongoDB URI
JWT_SECRET=<your_jwt_secret> # replace with your JWT secret
EUREKA_DISCOVERY_SERVER_HOST=discovery-server
EUREKA_DISCOVERY_SERVER_PORT=8761
KAFKA_CLIENT_HOST=kafka:29092
APP_PATH=/api/v1/messages
IP_ADDRESS=message-service
HOST_NAME=message-service
USER_SERVICE_GRPC_ADDRESS=user-service:50051
```

These variables are required for MongoDB connection, Eureka registration, JWT configuration, and Kafka communication.

## Package Installation

Ensure dependencies are installed by running:

```bash
npm install
```

## Running the Service Locally

To start the service locally:

```bash
npm start
```

The service will run on `http://localhost:3003` by default.

## Running with Docker

1. **Dockerfile**:

   Create a `Dockerfile` in the project root with the following content:

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /usr/src/app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3003
   CMD ["npm", "start"]
   ```

2. **Build and Run the Docker Container**:

   Build and start the Docker container:

   ```bash
   docker build -t message-service .
   docker run -p 3003:3003 --env-file .env message-service
   ```

## Running with Docker Compose

To run `message_service` within a Docker Compose setup, include the following service definition:

```yaml
message-service:
  image: message-service
  build:
    context: .
  ports:
    - 3003:3003
  environment:
    - APP_NAME=message-service
    - PORT=3003
    - MONGODB_URI=mongodb://goddie9x:thisIsJustTheTestPassword123@mongo:27017/message # replace with your MongoDB URI
    - JWT_SECRET=<your_jwt_secret> # replace with your JWT secret
    - EUREKA_DISCOVERY_SERVER_HOST=discovery-server
    - EUREKA_DISCOVERY_SERVER_PORT=8761
    - KAFKA_CLIENT_HOST=kafka:29092
    - APP_PATH=/api/v1/messages
    - IP_ADDRESS=message-service
    - HOST_NAME=message-service
    - USER_SERVICE_GRPC_ADDRESS=user-service:50051
  depends_on:
    - mongo
    - discovery-server
    - kafka
  networks:
    - social-media-network
```

Start all services with Docker Compose:

```bash
docker-compose up --build
```

## Accessing the Service

Once running, the `message_service` will be available at `http://localhost:3003/api/v1/messages`.

---

This setup will allow you to start, configure, and deploy the `message_service` in both local and containerized environments.

### Useful Commands

- **Stop Containers**: Use `docker-compose down` to stop all services and remove the containers.
- **Restart Containers**: Run `docker-compose restart` to restart the services without rebuilding the images.

This setup enables seamless orchestration of the social media microservices with an API Gateway for managing external client requests.

## Contributing

Contributions are welcome. Please clone this repository and submit a pull request with your changes. Ensure that your changes are well-tested and documented.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.