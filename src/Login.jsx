import { useState } from "react"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      const url =
        `http://localhost:8080/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`

      const response = await fetch(url, {
        method: "POST"
      })

      const data = await response.text()

      if (!response.ok) {
        throw new Error(data)
      }

      localStorage.setItem("token", data)

      alert("Login successful!")

    } catch (error) {
      console.error("LOGIN ERROR:", error)
      alert("Login failed")
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  )
}

export default Login