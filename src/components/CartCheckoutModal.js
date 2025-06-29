// CartCheckoutModal.js
import React, { useState } from "react";
import "./CartCheckoutModal.css";

function CartCheckoutModal({ visible, onClose }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("cod");
  const [upiId, setUpiId] = useState("");

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const total = cart.reduce((sum, item) => {
    const price = Number(item.finalPrice);
    const qty = Number(item.quantity);
    return !isNaN(price) && !isNaN(qty) ? sum + price * qty : sum;
  }, 0);

  const totalMRP = cart.reduce((sum, item) => {
    const mrp = Number(item.originalPrice || item.price);
    const qty = Number(item.quantity);
    return !isNaN(mrp) && !isNaN(qty) ? sum + mrp * qty : sum;
  }, 0);

  const totalSaved = totalMRP - total;

  const handleCheckout = () => {
    const now = new Date();
    const formattedDate = now.toLocaleString();

    const billDetails = `
🧾 E-Commerce Bill
Date: ${formattedDate}

Customer Name: ${name}
Address: ${address}
Phone: ${phone}
Payment Mode: ${paymentMode === "upi" ? `UPI (${upiId})` : "Cash on Delivery"}

-------------------------------
Items:
${cart
  .map(
    (item) =>
      `• ${item.name} × ${item.quantity} = ₹${
        Number(item.finalPrice) * Number(item.quantity) || 0
      }`
  )
  .join("\n")}

-------------------------------
Total MRP: ₹${totalMRP}
Total Savings: ₹${totalSaved}
Total Payable: ₹${total}

Thank you for shopping with us!
`;

    const blob = new Blob([billDetails], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `bill_${now.getTime()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();

    setTimeout(() => window.print(), 500);
    localStorage.removeItem("cart");
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Checkout</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div style={{ marginTop: "10px" }}>
          <strong>Choose Payment Method:</strong>
          <div>
            <label>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMode === "cod"}
                onChange={() => setPaymentMode("cod")}
              />{" "}
              Cash on Delivery
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMode === "upi"}
                onChange={() => setPaymentMode("upi")}
              />{" "}
              UPI
            </label>
            {paymentMode === "upi" && (
              <input
                type="text"
                placeholder="Enter UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            )}
          </div>
        </div>
        <div className="cart-items">
          <div className="bill-summary">
            <h3>🧾 Bill Summary</h3>
            <div className="summary-grid">
              <div>
                <strong>Item</strong>
              </div>
              <div>
                <strong>Qty</strong>
              </div>
              <div>
                <strong>Price</strong>
              </div>
              <div>
                <strong>Total</strong>
              </div>
              {cart.map((item, index) => {
                const itemTotal =
                  Number(item.finalPrice) * Number(item.quantity);
                return (
                  <React.Fragment key={index}>
                    <div>{item.name}</div>
                    <div>{item.quantity}</div>
                    <div>₹{item.finalPrice}</div>
                    <div>₹{itemTotal}</div>
                  </React.Fragment>
                );
              })}
            </div>
            <div className="total-line">
              <strong>Total:</strong> ₹{total}
            </div>
            <div className="total-line saving">
              You saved ₹
              {cart.reduce(
                (sum, item) =>
                  sum +
                  (Number(item.price) - Number(item.finalPrice)) *
                    Number(item.quantity),
                0
              )}{" "}
              on MRP!
            </div>
          </div>
          <div className="checkout-buttons">
            <button onClick={handleCheckout} id="btn">
              Download & Print Bill
            </button>
            <button onClick={onClose} className="cancel-button">
              <span role="img" aria-label="cross">
                ❌
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartCheckoutModal;
