const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'User not found!' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { body: { name, username } } = request

  const userExists = users.some(user => username === user.username)

  if (userExists) {
    return response.status(400).json({
      error: 'User already exists!'
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { todos } = user

  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { body: { title, deadline }, user } = request

  const todo =
  {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  const { id } = user

  const userIndex = users.findIndex((user) => user.id === id)

  users.splice(userIndex, 1, user)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    params: { id },
    body: { title, deadline },
    user
  } = request

  const { todos, id: userId } = user

  const todoFound = todos.find(todo => todo.id === id)

  if (!todoFound) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  const todo = {
    ...todoFound,
    title,
    deadline: new Date(deadline)
  }

  const todoIndex = todos.findIndex(({ id }) => id === todoFound.id)

  user.todos.splice(todoIndex, 1, todo)

  const userIndex = users.findIndex((user) => user.id === userId)

  users.splice(userIndex, 1, user)

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {
    params: { id },
    user
  } = request

  const { todos, id: userId } = user

  const todoFound = todos.find(todo => todo.id === id)

  if (!todoFound) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  const todo = {
    ...todoFound,
    done: true,
  }

  const todoIndex = todos.findIndex(({ id }) => id === todoFound.id)

  user.todos.splice(todoIndex, 1, todo)

  const userIndex = users.findIndex((user) => user.id === userId)

  users.splice(userIndex, 1, user)

  return response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    params: { id },
    user
  } = request

  const { todos, id: userId } = user

  const todoFound = todos.find(todo => todo.id === id)

  if (!todoFound) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  const todoIndex = todos.findIndex(({ id }) => id === todoFound.id)

  user.todos.splice(todoIndex, 1)

  const userIndex = users.findIndex((user) => user.id === userId)

  users.splice(userIndex, 1, user)

  return response.status(204).json()
});

module.exports = app;