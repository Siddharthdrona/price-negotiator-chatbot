// Home.js
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://api.npoint.io/58b64ff0a3e614d16095")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const exists = cart.find((item) => item.product_id === product.product_id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product_id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.product_id !== id));
  };

  const handleNegotiate = (product) => {
    const fullProduct = { ...product, quantity: parseInt(quantity) };
    const stateString = encodeURIComponent(JSON.stringify(fullProduct));
    window.open(`/negotiate?data=${stateString}`, "_blank");
  };

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Your cart is empty!");

    const userName = prompt("Enter your name:", "Nandini");
    const userLocation = prompt("Enter delivery location:", "Nizamabad");
    if (!userName || !userLocation) return;

    const estimatedTime = Math.floor(Math.random() * 31) + 30;
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("Order Receipt", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer Name: ${userName}`, 20, 30);
    doc.text(`Delivery Location: ${userLocation}`, 20, 40);
    doc.text(`Estimated Delivery Time: ${estimatedTime} minutes`, 20, 50);
    doc.text("Order Summary:", 20, 60);

    let y = 70;
    cart.forEach((item) => {
      doc.text(
        `${item.name} x${item.quantity} - ₹${(
          item.price * item.quantity
        ).toFixed(2)}`,
        20,
        y
      );
      y += 10;
    });

    doc.text(`Total Amount: ₹${total.toFixed(2)}`, 20, y + 10);
    doc.save(`Order_Receipt_${userName.replace(/\s+/g, "_")}.pdf`);

    alert("Thank you for your purchase! Your receipt has been downloaded.");
    setCart([]);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login");
  };

  const filterCategory = (category) => {
    setFilteredProducts(
      category === "All"
        ? products
        : products.filter((p) => p.category === category)
    );
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">🛒 Nandini E-Com Shop
      </h2>

      <div className="mb-3 d-flex justify-content-between">
        <select
          className="form-select w-auto"
          onChange={(e) => filterCategory(e.target.value)}>
          <option>All</option>
          <option>Electronics</option>
          <option>Food</option>
          <option>Mobiles</option>
          <option>Laptops</option>
          <option>Clothing</option>
          <option>Accessories</option>
          <option>Western Dress</option>
          <option>Beauty Products</option>
          <option>Shoes</option>
        </select>
        <button className="btn btn-success" onClick={handleCheckout}>
          Checkout ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
        </button>
        <button className="btn btn-success" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <div className="row">
        {filteredProducts.map((product) => (
          <div key={product.product_id} className="col-md-3 col-sm-6 mb-4">
            <div className="card h-100">
              <img
                src={product.image_url}
                className="card-img-top"
                alt={product.name}
                onError={(e) => (e.target.src = "fallback.jpg")}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p>₹{product.price.toFixed(2)}</p>
                <p className="text-muted">{product.category}</p>
                <p style={{ flexGrow: 1 }}>{product.description}</p>
                <input
                  type="number"
                  min="1"
                  className="form-control mb-2"
                  placeholder="Qty"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleNegotiate(product)}>
                    Negotiate
                  </button>
                </div>
                {(() => {
                  const reviewData = JSON.parse(
                    localStorage.getItem("userReview")
                  );
                  if (
                    reviewData &&
                    reviewData.product_id === product.product_id
                  ) {
                    return (
                      <div className="mt-2">
                        <p style={{ margin: 0 }}>
                          <strong>{reviewData.name}</strong> rated it {" "}
                          {reviewData.rating}/5 ⭐
                        </p>
                        <blockquote style={{ fontSize: "smaller", color: "#555" }}>
                          "{reviewData.review}"
                        </blockquote>
                      </div>
                    );
                  } else {
                    return <p className="text-muted">No reviews yet</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h4 className="mt-5">🛍️ Your Cart
      </h4>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map((item) => (
          <div key={item.product_id} className="d-flex align-items-center mb-3">
            <img
              src={item.image_url}
              alt={item.name}
              width={200}
              height={200}
              className="me-3 rounded"
            />
            <div className="flex-grow-1">
              <div>{item.name}</div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => updateQuantity(item.product_id, -1)}>
                  -
                </button>
                {item.quantity}
                <button
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => updateQuantity(item.product_id, 1)}>
                  +
                </button>
              </div>
            </div>
            <div className="ms-3">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
            <button
              className="btn btn-sm btn-danger ms-3"
              onClick={() => removeFromCart(item.product_id)}>
              🗑️
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
