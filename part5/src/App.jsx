import { useState, useEffect } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login"

const App = () => {
  const [errorMessage, setErrorMessage] = useState("")
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null)

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  // Handle login submission
  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({username, password})
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }

    console.log("logging in with", username, password);
  };

  // Login form helper
  const loginForm = () => (
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input 
              type="text"
              value={username}
              onChange={({target}) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="text"
              value={password}
              onChange={({target}) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
  )

  

  return (
    <div>
      <h2>Blogs</h2>
      {errorMessage}

      <h2>Login</h2>

      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default App;
