// src/pages/NegotiatePage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import './NegotiatePage.css';

function NegotiatePage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const productData = query.get('data');
  const product = productData ? JSON.parse(decodeURIComponent(productData)) : null;

  if (!product) {
    return <div className="container mt-4">⚠️ No product selected for negotiation.</div>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">🗣️ Negotiating: {product.name}</h3>

      <div className="row mb-4">
        <div className="col-md-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="img-fluid rounded"
            onError={(e) => (e.target.src = "/fallback.jpg")}
          />
        </div>
        <div className="col-md-8">
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Description:</strong> {product.description}</p>
          <p><strong>Original Price:</strong> ₹{product.price}</p>
          <p><strong>Quantity:</strong> {product.quantity}</p>
        </div>
      </div>

      <Chatbot product={product} />
    </div>
  );
}

export default NegotiatePage;
