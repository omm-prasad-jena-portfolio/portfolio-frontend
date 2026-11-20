import React, { useState, useRef, useEffect } from "react";
import { usePrivateAuth } from "../context/PrivateAuthContext";
import "./styles/PrivateAuthModal.css";

export const PrivateAuthModal: React.FC = () => {
  const { isModalOpen, closeModal, unlock } = usePrivateAuth();


  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isModalOpen) {
      setDigits(["", "", "", ""]);
      setErrorMessage("");
      setIsVerifying(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 50);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    const digit = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setErrorMessage("");

    // Advance focus to next input
    if (index < 3 && digit) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (digits.join("").length === 4 && !isVerifying) {
        handleUnlock();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData) {
      const newDigits = ["", "", "", ""];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);
      setErrorMessage("");

      const focusIdx = Math.min(pastedData.length, 3);
      inputRefs[focusIdx].current?.focus();
    }
  };

  const handleUnlock = async () => {
    const pin = digits.join("");
    if (pin.length !== 4) return;

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const result = await unlock(pin);
      if (result.success) {
        const personalAppUrl = (
          import.meta.env.VITE_PERSONAL_APP_URL ||
          import.meta.env.VITE_PERSONAL_URL ||
          (import.meta.env.PROD ? 'https://portfolio-personal-mu-ruddy.vercel.app' : "http://localhost:5174")
        ).replace(/\/$/, '');
        window.location.href = personalAppUrl;
      } else {

        setErrorMessage(result.message || "Incorrect PIN.");
        setDigits(["", "", "", ""]);
        setTimeout(() => {
          inputRefs[0].current?.focus();
        }, 50);
      }
    } catch {
      setErrorMessage("Unable to verify PIN. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const fullPinLength = digits.join("").length;

  return (
    <div className="private-modal-overlay" onClick={closeModal}>
      <div className="private-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="private-modal-close"
          onClick={closeModal}
          aria-label="Close"
          type="button"
        >
          ✕
        </button>

        <div className="private-modal-header">
          <h2>Private Area</h2>
          <p>Enter 4-digit PIN</p>
        </div>

        <div className="private-pin-container">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              autoComplete="one-time-code"
              className="private-pin-input"
              value={digit}
              disabled={isVerifying}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {errorMessage && (
          <div className="private-error-message">{errorMessage}</div>
        )}

        <div className="private-modal-actions">
          <button
            type="button"
            className="private-btn-unlock"
            disabled={fullPinLength < 4 || isVerifying}
            onClick={handleUnlock}
          >
            {isVerifying ? "Verifying..." : "Unlock"}
          </button>
          <button
            type="button"
            className="private-btn-cancel"
            disabled={isVerifying}
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateAuthModal;
