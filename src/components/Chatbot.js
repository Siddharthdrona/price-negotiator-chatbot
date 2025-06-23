// Chatbot.js
import React, { useEffect, useState } from "react";
import "./Chatbot.css";
import CartCheckoutModal from "../components/CartCheckoutModal";

function Chatbot({ visible, setVisible, product }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [negotiationCount, setNegotiationCount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(null);
  const [cartAdded, setCartAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const closeChat = () => setVisible(false);

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (visible && product) {
      const total = Number(product.price) * Number(product.quantity);
      const intro = `Negotiating for ${product.quantity} x ${product.name} = ₹${total}`;
      setMessages([{ from: "bot", text: intro }]);
      speakText(intro);
      setFinalPrice(total);
      setNegotiationCount(0);
      setCartAdded(false);
    }
  }, [visible, product]);

  const calculatePrice = (originalPrice, count) => {
    const maxDiscount = 25;
    const perRound = 5;
    const discount = Math.min(perRound * count, maxDiscount);
    return Math.round(originalPrice * (1 - discount / 100));
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessages = [...messages, { from: "user", text: trimmed }];
    const lower = trimmed.toLowerCase();
    let response = "Sorry, I didn’t understand that.";

    const originalTotal = Number(product.price) * Number(product.quantity);
    let newPrice = finalPrice;

    if (
      lower.includes("aur") ||
      lower.includes("kam") ||
      lower.includes("bargain")
    ) {
      const newCount = negotiationCount + 1;
      newPrice = calculatePrice(originalTotal, newCount);
      response =
        newCount * 5 >= 25
          ? `Okay okay! This is my final offer 🙏 — ₹${newPrice}. Click below to add to cart.`
          : `Hmm... ₹${
              originalTotal - newPrice
            } off okay! New price: ₹${newPrice}`;
      setNegotiationCount(newCount);
    } else if (lower.includes("final price")) {
      newPrice = calculatePrice(originalTotal, 5);
      response = `Alright! Final price: ₹${newPrice}. You can add to cart now.`;
      setNegotiationCount(5);
    } else if (lower.includes("discount")) {
      response = `Sure, let's start the deal. Ask for more by saying "aur kam karo" `;
    }

    setMessages([...newMessages, { from: "bot", text: response }]);
    speakText(response);
    setFinalPrice(newPrice);
    setInput("");
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input not supported.");

    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.start();
    recog.onresult = (e) => {
      const speech = e.results[0][0].transcript;
      setInput(speech);
      setTimeout(() => handleSend(), 300);
    };
  };
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if product already exists
    const existing = cart.find(
      (item) => item.product_id === product.product_id
    );
    if (existing) {
      existing.quantity += Number(product.quantity);
      existing.price = Number(finalPrice) / Number(product.quantity); // update price per unit
    } else {
      cart.push({
        product_id: product.product_id,
        name: product.name,
        image_url: product.image_url,
        quantity: Number(product.quantity),
        price: Number(finalPrice) / Number(product.quantity),
        category: product.category,
        description: product.description,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartAdded(true);
    setShowModal(true);
    speakText("Product added to cart at negotiated price!");
  };

  return (
    <div className={`chatbox ${visible ? "visible" : ""}`}>
      <div className="chat-header">Negotiator Bot</div>
      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <button onClick={handleVoiceInput}>🎤</button>
        <input
          type="text"
          placeholder="Type here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
        <button onClick={closeChat}>❌</button>
      </div>

      {negotiationCount >= 5 && !cartAdded && (
        <div style={{ padding: "10px", textAlign: "center" }}>
          <button
            onClick={addToCart} 
            style={{
              padding: "8px 12px",
              background: "#00b894",
              color: "#fff",
              borderRadius: "5px",
            }}>
            🛒 Add to Cart at ₹{finalPrice}
          </button>
        </div>
      )}

      {cartAdded && (
        <div style={{ padding: "10px", textAlign: "center", color: "#00b894" }}>
          ✅ Added to cart!
        </div>
      )}

      <CartCheckoutModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />

      <button className="checkout-btn" onClick={() => setShowModal(true)}>
        Checkout
      </button>
    </div>
  );
}

export default Chatbot;
