import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

const auth = {
  isAuthenticated: localStorage.getItem("isTodoLoggedIn") || false,
  login(credentials) {
    return axios
      .post("https://testreacttodoapp.herokuapp.com/auth/local", credentials)
      .then(response => response.data)
      .catch(err => console.log("error", err));
  },
  logout() {}
};

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      isAuthenticated: auth.isAuthenticated
    };
  }

  handleSubmit = e => {
    console.log(e);
    auth
      .login({
        identifier: e.target.querySelector("input[name='username']").value,
        password: e.target.querySelector("input[name='password']").value
      })
      .then(data => {
        auth.isAuthenticated = true;
        this.setState({
          isAuthenticated: true
        });

        localStorage.setItem("isTodoLoggedIn", true);
        console.log(auth);
      });

    // console.log(auth);

    e.preventDefault();
  };

  render() {
    console.log("auth", auth);
    if (auth.isAuthenticated) {
      return (
        <Redirect
          to={{
            pathname: "/"
          }}
        />
      );
    }

    return (
      <form method="post" onSubmit={this.handleSubmit}>
        <p>
          Username: <input type="text" name="username" />
        </p>
        <p>
          Password: <input type="password" name="password" />
        </p>
        <button>Login</button>
      </form>
    );
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      todos: [],
      isFetching: true
    };
  }

  componentDidMount() {
    fetch("https://testreacttodoapp.herokuapp.com/todos")
      .then(response => response.json())
      .then(todos =>
        this.setState({
          todos: todos,
          isFetching: false
        })
      );
  }

  handleSubmit = e => {
    const newTodo = e.target.querySelector("input").value;
    e.target.querySelector("input").value = "";

    axios
      .post("https://testreacttodoapp.herokuapp.com/todos", {
        title: newTodo
      })
      .then(response => response.data)
      .then(addedTodo =>
        this.setState({
          todos: [
            ...this.state.todos,
            {
              id: addedTodo.id,
              title: addedTodo.title
            }
          ]
        })
      );

    e.preventDefault();
  };

  handleDelete(id) {
    axios
      .delete("https://testreacttodoapp.herokuapp.com/todos/" + id)
      .then(response => response.data)
      .then(deletedTodo => {
        this.setState({
          todos: this.state.todos.filter(todo => todo.id !== deletedTodo.id)
        });
      });
  }

  render() {
    if (!auth.isAuthenticated) {
      return (
        <Redirect
          to={{
            pathname: "/login"
          }}
        />
      );
    }

    return (
      <div>
        <h2>Todo list</h2>
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="What needs to be done?" />
        </form>

        {this.state.isFetching ? (
          <p>Fetching todos...</p>
        ) : (
          <ul>
            {this.state.todos.map(todo => (
              <li key={todo.id}>
                {todo.title}{" "}
                <button onClick={e => this.handleDelete(todo.id)}>x</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

class Main extends React.Component {
  render() {
    return (
      <Router>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
      </Router>
    );
  }
}

export default Main;
