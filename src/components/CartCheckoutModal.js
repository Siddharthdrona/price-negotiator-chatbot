// CartCheckoutModal.js
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './CartCheckoutModal.css';

function CartCheckoutModal({ visible, onClose }) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [submitted, setSubmitted] = useState(false);
  const billRef = useRef();
  const total = cart.reduce((sum, item) => sum + item.finalPrice, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.address) return alert("Please fill all fields");
    setSubmitted(true);
  };

  const downloadPDF = () => {
    html2canvas(billRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("bill.pdf");
    });
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose} className="close-btn">✖</button>

        {!submitted ? (
          <>
            <h3>Enter your details</h3>
            <input name="name" placeholder="Name" onChange={handleChange} />
            <input name="phone" placeholder="Phone" onChange={handleChange} />
            <textarea name="address" placeholder="Address" onChange={handleChange} />
            <button onClick={handleSubmit} className="submit-btn">Generate Bill</button>
          </>
        ) : (
          <>
            <div ref={billRef}>
              <h3>🧾 Final Bill</h3>
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Phone:</strong> {form.phone}</p>
              <p><strong>Address:</strong> {form.address}</p>
              <hr />
              <table className="bill-table">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.finalPrice}</td>
                    </tr>
                  ))}
                  <tr><td colSpan="2"><strong>Total</strong></td><td><strong>₹{total}</strong></td></tr>
                </tbody>
              </table>
            </div>
            <button onClick={downloadPDF} className="submit-btn">📄 Download PDF</button>
            <p>✅ Thank you for your purchase!</p>
          </>
        )}
      </div>
    </div>
  );
}

export default CartCheckoutModal;
