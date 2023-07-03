import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

import { useApolloClient } from '@apollo/client'

const App = () => {
  const [token, setToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [page, setPage] = useState('authors')
  const client = useApolloClient();

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const Notify = ({ errorMessage }) => {
    if (!errorMessage) {
      return null;
    }
    return <div style={{ color: "red" }}>{errorMessage}</div>;
  };

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    // ensure logged out user is not a user only page
    setPage("authors");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {!token && <button onClick={() => setPage("login")}>login</button>}
        {token && <button onClick={logout}>logout</button>}
      </div>

      <Authors show={page === "authors"} token={token}/>

      <Books show={page === "books"} />

      <Notify errorMessage={errorMessage} />
      <NewBook show={page === "add"} setError={notify} />
      {page === "login" && <LoginForm setError={notify} setToken={setToken} setPage={setPage} />}
    </div>
  );
}

export default App
