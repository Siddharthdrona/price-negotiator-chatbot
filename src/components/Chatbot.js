import React, { useEffect, useState } from "react";
import "./Chatbot.css";
import CartCheckoutModal from "../components/CartCheckoutModal";

function Chatbot({ visible = true, setVisible = () => {}, product }) {
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
    const maxDiscount = 15; // 15% max
    let discount = 1 + (count - 1) * 0.5; // 1%, 1.5%, 2%, ...
    discount = Math.min(discount, maxDiscount);
    return Math.round(originalPrice * (1 - discount / 100));
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    speechSynthesis.cancel(); // Stop ongoing speech when sending

    const newMessages = [...messages, { from: "user", text: trimmed }];
    const lower = trimmed.toLowerCase();
    let response = "Sorry, Not Negotiable.";

    const originalTotal = Number(product.price) * Number(product.quantity);
    let newPrice = finalPrice;

    const bargainingWords = [
      "nkka", "kam", "bargain", "thakkuva", "thagginchandi", "cheap",
      "koncham thakkuva", "inkoka sari", "inka", "deal", "inkemaina",
      "manchi rate", "thaggatam", "rate thakkuva", "konchem taggandi", "inka taggali"
    ];

    const matched = bargainingWords.some(word => lower.includes(word));

    if (matched) {
      const newCount = negotiationCount + 1;
      newPrice = calculatePrice(originalTotal, newCount);
      const discountValue = originalTotal - newPrice;

      response =
        (1 + (newCount - 1) * 0.5) >= 15
          ? `Okay! This is my final offer — ₹${newPrice}. Click below to add to cart.`
          : `Hmm... ₹${discountValue.toFixed(2)} off okay! New price: ₹${newPrice}`;

      setNegotiationCount(newCount);
    } else if (lower.includes("final price")) {
      newPrice = calculatePrice(originalTotal, 30); // simulate 15% discount
      response = `Alright! Final price: ₹${newPrice}. You can add to cart now.`;
      setNegotiationCount(30);
    } else if (lower.includes("discount")) {
      response = `Sure, let's start the deal. Ask for more by saying "inka thakkuva cheyyandi"`;
    }

    setMessages([...newMessages, { from: "bot", text: response }]);
    speakText(response);
    setFinalPrice(newPrice);
    setInput("");
  };

  const handleVoiceInput = () => {
    speechSynthesis.cancel(); // Stop voice when mic starts

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

    recog.onerror = (err) => {
      console.error("Voice input error:", err);
    };
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const newItem = {
      product_id: product.product_id,
      name: product.name,
      image_url: product.image_url,
      quantity: Number(product.quantity),
      price: product.price,
      finalPrice: Number(finalPrice),
    };
    cart.push(newItem);
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
          <div key={i} className={`msg ${msg.from}`}>{msg.text}</div>
        ))}
      </div>

      <div className="chat-input">
        <button onClick={handleVoiceInput}>🎤</button>
        <input
          type="text"
          placeholder="Type here..."
          value={input}
          onChange={(e) => {
            speechSynthesis.cancel(); // Stop speech when typing
            setInput(e.target.value);
          }}
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
            }}
          >
            🛒 Add to Cart at ₹{finalPrice}
          </button>
        </div>
      )}

      {cartAdded && (
        <div style={{ padding: "10px", textAlign: "center", color: "#00b894" }}>
          ✅ Added to cart!
        </div>
      )}

      <div
        className="checkout-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "20px",
        }}
      >
        <CartCheckoutModal
          visible={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>

      <button className="checkout-btn" onClick={() => setShowModal(true)}>
        Checkout
      </button>
    </div>
  );
}

export default Chatbot;
