# My Todo App — Express API

A responsive Todo application built using HTML, CSS, vanilla JavaScript, Node.js, and Express.js. It allows users to create tasks, view their tasks, mark tasks as completed, and delete tasks.

## Features

- Add new tasks
- View all tasks
- Mark tasks as completed or incomplete
- Delete tasks
- Reject empty tasks
- Responsive layout for desktop and mobile
- Loading, empty, and error messages
- REST API built with Express.js
- In-memory task storage without a database

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js

## Project Structure

```
TO-DO APP/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## Installation and Setup

1. Install Node.js.
2. Open the project folder in a terminal.
3. Install the dependencies:

```
npm install
```

4. Start the server:

```
npm start
```

5. Open the application in your browser:

[http://localhost:3000](http://localhost:3000/)

## API Endpoints

| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| GET    | `/api/todos`     | Retrieve all tasks  |
| POST   | `/api/todos`     | Create a new task   |
| PATCH  | `/api/todos/:id` | Update a task       |
| DELETE | `/api/todos/:id` | Delete a task       |

## Todo Object

Each task uses the following structure:

```
{
  "id": 1,
  "text": "Complete assignment",
  "completed": false
}
```

## Storage

Tasks are stored in an in-memory array on the server. They remain available while the server is running, including after a browser refresh. Restarting the server clears the tasks.

## Author

Created as a Todo App project using Node.js and Express.js.
