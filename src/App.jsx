import { useEffect, useState } from "react"
import "./App.css"

const API = "http://localhost:8080"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [showRegister, setShowRegister] = useState(false)

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [comparison, setComparison] = useState(null)

  const [maxPrice, setMaxPrice] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [rangeMaxPrice, setRangeMaxPrice] = useState("")
  const [category, setCategory] = useState("")
  const [sortOrder, setSortOrder] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    name: "",
    amazonPrice: "",
    flipkartPrice: "",
    productUrl: "",
    category: "",
    sellerId: ""
  })

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const isAdmin = () => {
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.role === "ADMIN"
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (token) {
      loadProducts()
    }
  }, [token])

  // =========================
  // PRODUCTS
  // =========================

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API}/products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Unable to load products")
      }

      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadProducts()
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API}/products/search?name=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      setProducts(data)
    } catch {
      setError("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async (id) => {
    try {
      const response = await fetch(
        `${API}/products/${id}/compare`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error()
      }

      const data = await response.json()
      setComparison(data)
    } catch {
      setError("Unable to compare prices")
    }
  }

  const handleMaxPrice = async () => {
    if (!maxPrice) {
      loadProducts()
      return
    }

    const response = await fetch(
      `${API}/products/filter?maxPrice=${maxPrice}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()
    setProducts(data)
  }

  const handleRange = async () => {
    if (!minPrice || !rangeMaxPrice) return

    const response = await fetch(
      `${API}/products/filter/range?minPrice=${minPrice}&maxPrice=${rangeMaxPrice}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()
    setProducts(data)
  }

  const handleSort = async (order) => {
    setSortOrder(order)

    if (!order) {
      loadProducts()
      return
    }

    const response = await fetch(
      `${API}/products/sort?order=${order}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()
    setProducts(data)
  }

  const handleCategory = async () => {
    if (!category) {
      loadProducts()
      return
    }

    const response = await fetch(
      `${API}/products/category/${encodeURIComponent(category)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()
    setProducts(data)
  }

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      setError("")

      const response = await fetch(
        `${API}/users/login?email=${encodeURIComponent(
          loginForm.email
        )}&password=${encodeURIComponent(loginForm.password)}`,
        {
          method: "POST"
        }
      )

      const data = await response.text()

      if (!response.ok) {
        throw new Error(data)
      }

      localStorage.setItem("token", data)
      setToken(data)

      setLoginForm({
        email: "",
        password: ""
      })
    } catch (err) {
      setError("Login failed. Check your email and password.")
    }
  }

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      setError("")

      const response = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerForm)
      })

      if (!response.ok) {
        throw new Error()
      }

      alert("Registration successful. Please login.")

      setRegisterForm({
        name: "",
        email: "",
        password: ""
      })

      setShowRegister(false)
    } catch {
      setError("Registration failed.")
    }
  }

  // =========================
  // ADMIN
  // =========================

  const handleInput = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)

    setForm({
      name: "",
      amazonPrice: "",
      flipkartPrice: "",
      productUrl: "",
      category: "",
      sellerId: ""
    })
  }

  const handleAdd = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          amazonPrice: Number(form.amazonPrice),
          flipkartPrice: Number(form.flipkartPrice),
          productUrl: form.productUrl,
          category: form.category,
          sellerId: Number(form.sellerId)
        })
      })

      if (!response.ok) {
        throw new Error()
      }

      alert("Product added successfully")
      resetForm()
      loadProducts()
    } catch {
      setError("Failed to add product")
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)

    setForm({
      name: product.name,
      amazonPrice: product.amazonPrice,
      flipkartPrice: product.flipkartPrice,
      productUrl: product.productUrl || "",
      category: product.category || "",
      sellerId: ""
    })

    setShowForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `${API}/products/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: form.name,
            amazonPrice: Number(form.amazonPrice),
            flipkartPrice: Number(form.flipkartPrice),
            productUrl: form.productUrl,
            category: form.category
          })
        }
      )

      if (!response.ok) {
        throw new Error()
      }

      alert("Product updated successfully")
      resetForm()
      loadProducts()
    } catch {
      setError("Failed to update product")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) {
      return
    }

    try {
      const response = await fetch(
        `${API}/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error()
      }

      loadProducts()
    } catch {
      setError("Failed to delete product")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setProducts([])
  }

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!token) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="brand">
            <div className="brand-icon">₹</div>

            <h1>PriceCompare</h1>

            <p>
              Find the best price before you buy.
            </p>
          </div>

          {!showRegister ? (
            <form onSubmit={handleLogin}>

              <h2>Welcome back</h2>

              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    email: e.target.value
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password: e.target.value
                  })
                }
                required
              />

              <button className="primary-button">
                Login
              </button>

              <p className="switch-text">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="link-button"
                >
                  Register
                </button>
              </p>

            </form>
          ) : (
            <form onSubmit={handleRegister}>

              <h2>Create account</h2>

              <input
                type="text"
                placeholder="Name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    name: e.target.value
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    email: e.target.value
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value
                  })
                }
                required
              />

              <button className="primary-button">
                Create Account
              </button>

              <p className="switch-text">
                Already have an account?
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="link-button"
                >
                  Login
                </button>
              </p>

            </form>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        </div>

      </div>
    )
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app">

      <nav className="navbar">

        <div className="nav-brand">
          <span>₹</span>
          PriceCompare
        </div>

        <div className="nav-right">

          {isAdmin() && (
            <span className="role-badge">
              ADMIN
            </span>
          )}

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      <section className="hero">

        <div>
          <span className="hero-tag">
            SMART SHOPPING
          </span>

          <h1>
            Find the best price.
            <br />
            <span>Save more money.</span>
          </h1>

          <p>
            Compare product prices across Amazon
            and Flipkart in one place.
          </p>
        </div>

      </section>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* SEARCH */}

      <div className="search-container">

        <input
          placeholder="Search for a product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
        />

        <button
          className="search-button"
          onClick={handleSearch}
        >
          Search
        </button>

        <button
          className="all-button"
          onClick={loadProducts}
        >
          All
        </button>

      </div>

      {/* ADMIN */}

      {isAdmin() && (
        <div className="admin-panel">

          <div>
            <strong>Admin Panel</strong>
            <span>
              Manage products
            </span>
          </div>

          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
          >
            + Add Product
          </button>

        </div>
      )}

      {/* FORM */}

      {showForm && isAdmin() && (
        <div className="form-card">

          <h2>
            {editingId
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <form
            onSubmit={
              editingId
                ? handleUpdate
                : handleAdd
            }
          >

            <input
              name="name"
              placeholder="Product name"
              value={form.name}
              onChange={handleInput}
              required
            />

            <input
              name="amazonPrice"
              type="number"
              placeholder="Amazon price"
              value={form.amazonPrice}
              onChange={handleInput}
              required
            />

            <input
              name="flipkartPrice"
              type="number"
              placeholder="Flipkart price"
              value={form.flipkartPrice}
              onChange={handleInput}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleInput}
              required
            />

            <input
              name="productUrl"
              placeholder="Product URL"
              value={form.productUrl}
              onChange={handleInput}
            />

            {!editingId && (
              <input
                name="sellerId"
                type="number"
                placeholder="Seller ID"
                value={form.sellerId}
                onChange={handleInput}
                required
              />
            )}

            <div className="form-actions">

              <button className="save-button">
                {editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* FILTERS */}

      <div className="filter-section">

        <div>
          <label>Maximum price</label>

          <input
            type="number"
            placeholder="₹ 50,000"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value)
            }
          />

          <button onClick={handleMaxPrice}>
            Apply
          </button>
        </div>

        <div>
          <label>Price range</label>

          <div className="range-inputs">

            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value)
              }
            />

            <input
              type="number"
              placeholder="Max"
              value={rangeMaxPrice}
              onChange={(e) =>
                setRangeMaxPrice(e.target.value)
              }
            />

          </div>

          <button onClick={handleRange}>
            Apply
          </button>

        </div>

        <div>
          <label>Sort</label>

          <select
            value={sortOrder}
            onChange={(e) =>
              handleSort(e.target.value)
            }
          >
            <option value="">
              Default
            </option>

            <option value="asc">
              Price: Low to High
            </option>

            <option value="desc">
              Price: High to Low
            </option>
          </select>
        </div>

        <div>
          <label>Category</label>

          <input
            placeholder="Electronics"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          />

          <button onClick={handleCategory}>
            Apply
          </button>
        </div>

      </div>

      {/* COMPARISON */}

      {comparison && (
        <div className="comparison-card">

          <button
            className="close-button"
            onClick={() => setComparison(null)}
          >
            ×
          </button>

          <h2>
            {comparison.productName}
          </h2>

          <div className="comparison-prices">

            <div>
              <small>Amazon</small>
              <strong>
                ₹{comparison.amazonPrice}
              </strong>
            </div>

            <div>
              <small>Flipkart</small>
              <strong>
                ₹{comparison.flipkartPrice}
              </strong>
            </div>

          </div>

          <div className="winner">

            Best price:
            <strong>
              {comparison.cheaperPlatform}
            </strong>

            <span>
              Save ₹{comparison.saving}
            </span>

          </div>

        </div>
      )}

      {/* PRODUCTS */}

      <div className="products-header">

        <h2>Products</h2>

        <span>
          {products.length} products
        </span>

      </div>

      {loading ? (

        <div className="loading">
          Loading products...
        </div>

      ) : products.length === 0 ? (

        <div className="empty">
          No products found.
        </div>

      ) : (

        <div className="products">

          {products.map(product => (

            <div
              className="product-card"
              key={product.id}
            >

              <div className="product-category">
                {product.category || "General"}
              </div>

              <h2>
                {product.name}
              </h2>

              <div className="prices">

                <div className="store amazon">
                  <small>Amazon</small>
                  <strong>
                    ₹{product.amazonPrice}
                  </strong>
                </div>

                <div className="store flipkart">
                  <small>Flipkart</small>
                  <strong>
                    ₹{product.flipkartPrice}
                  </strong>
                </div>

              </div>

              <button
                className="compare-button"
                onClick={() =>
                  handleCompare(product.id)
                }
              >
                Compare Prices
              </button>

              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="buy-button"
                >
                  View Product
                </a>
              )}

              {isAdmin() && (
                <div className="admin-buttons">

                  <button
                    className="edit-button"
                    onClick={() =>
                      startEdit(product)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(product.id)
                    }
                  >
                    Delete
                  </button>

                </div>
              )}

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default App