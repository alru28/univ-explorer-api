# UnivExplorer

UnivExplorer is a web application that enables users to explore information about planets in our solar system and discover new celestial bodies. Users can publish their discoveries, allowing others to see and interact with them, creating a collaborative and engaging space exploration experience.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Microservices Architecture**: The project is organized into microservices, each handling distinct functionalities, all containerized with Docker.
- **Authentication Service**: Built with Node.js, it manages user authentication and data storage using PostgreSQL.
- **Celestial Collection Service**: Developed with FastAPI, it fetches planetary data from Wikidata using SPARQL queries.
- **Exploration Service**: Also created with FastAPI, this service uses LLMs hosted on Ollama to generate information about new planets and stores it in MongoDB.
- **Gateway API**: A unified API gateway built with FastAPI encapsulates all functionalities and serves them to the frontend.
- **ReactStrap Frontend**: The user interface is a React application served with Vite and styled with ReactStrap, providing a responsive and user-friendly experience.

## Installation

To set up UnivExplorer locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/alru28/univ-explorer-api.git
   cd univ-explorer-api/src
   ```

2. Launch the Docker containers:
	```bash
    docker compose up
	```
	
This will start all microservices, the unified gateway API, and the frontend.

## Usage

Once the installation is complete, you can access UnivExplorer's frontend by opening your web browser and navigating to:

> http://localhost:3000

From there, you can register, log in, explore the planets, and even discover new celestial bodies to share with the UnivExplorer community.

Besides, you can also check our programatic API by opening your web browser and navigating to:

> http://localhost:8080/docs

## Contributing

We welcome contributions to UnivExplorer! You can contribute by:

- Forking the repository
- Creating a new branch for your feature or bug fix
- Making your changes and ensuring they follow the project's code style
- Submitting a pull request for review

Please make sure to add relevant documentation and tests for any new features.

## License

This project is licensed under the Apache License. See the LICENSE file for more details.
