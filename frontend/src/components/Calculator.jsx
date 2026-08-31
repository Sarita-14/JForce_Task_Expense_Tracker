import { useState } from "react";
import { Delete, X } from "lucide-react";

// A small, real calculator engine (no eval): tracks an accumulator, the
// pending operator, and whether the next digit should start a fresh number.
function calculate(accumulator, operand, operator) {
  switch (operator) {
    case "+":
      return accumulator + operand;
    case "-":
      return accumulator - operand;
    case "×":
      return accumulator * operand;
    case "÷":
      return operand === 0 ? NaN : accumulator / operand;
    default:
      return operand;
  }
}

export default function Calculator({ onUseResult, onClose }) {
  const [display, setDisplay] = useState("0");
  const [accumulator, setAccumulator] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  function inputDigit(digit) {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }

  function inputDecimal() {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }

  function clearAll() {
    setDisplay("0");
    setAccumulator(null);
    setOperator(null);
    setWaitingForNewValue(false);
  }

  function backspace() {
    if (waitingForNewValue) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  }

  function toggleSign() {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
  }

  function applyPercent() {
    setDisplay(String(Number(display) / 100));
  }

  function handleOperator(nextOperator) {
    const inputValue = Number(display);

    if (accumulator === null) {
      setAccumulator(inputValue);
    } else if (operator && !waitingForNewValue) {
      const result = calculate(accumulator, inputValue, operator);
      setAccumulator(result);
      setDisplay(String(result));
    }

    setOperator(nextOperator);
    setWaitingForNewValue(true);
  }

  function handleEquals() {
    const inputValue = Number(display);

    if (operator && accumulator !== null) {
      const result = calculate(accumulator, inputValue, operator);
      setDisplay(String(result));
      setAccumulator(null);
      setOperator(null);
      setWaitingForNewValue(true);
    }
  }

  function handleUseResult() {
    const value = Math.abs(Number(display));
    if (Number.isFinite(value) && value > 0) {
      onUseResult(value.toFixed(2));
    }
  }

  const buttons = [
    { label: "C", onClick: clearAll, className: "calc-fn" },
    { label: "±", onClick: toggleSign, className: "calc-fn" },
    { label: "%", onClick: applyPercent, className: "calc-fn" },
    { label: "÷", onClick: () => handleOperator("÷"), className: "calc-op" },

    { label: "7", onClick: () => inputDigit("7") },
    { label: "8", onClick: () => inputDigit("8") },
    { label: "9", onClick: () => inputDigit("9") },
    { label: "×", onClick: () => handleOperator("×"), className: "calc-op" },

    { label: "4", onClick: () => inputDigit("4") },
    { label: "5", onClick: () => inputDigit("5") },
    { label: "6", onClick: () => inputDigit("6") },
    { label: "-", onClick: () => handleOperator("-"), className: "calc-op" },

    { label: "1", onClick: () => inputDigit("1") },
    { label: "2", onClick: () => inputDigit("2") },
    { label: "3", onClick: () => inputDigit("3") },
    { label: "+", onClick: () => handleOperator("+"), className: "calc-op" },

    { label: "0", onClick: () => inputDigit("0"), className: "calc-zero" },
    { label: ".", onClick: inputDecimal },
    { label: "=", onClick: handleEquals, className: "calc-equals" }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card calculator-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="calculator-header">
          <h3>Calculator</h3>
          <button
            type="button"
            className="input-icon-btn"
            onClick={onClose}
            aria-label="Close calculator"
          >
            <X size={18} />
          </button>
        </div>

        <div className="calculator-display">
          <span>{operator ? `${accumulator} ${operator}` : ""}</span>
          <strong>{display}</strong>
        </div>

        <div className="calculator-grid">
          {buttons.map((button) => (
            <button
              type="button"
              key={button.label}
              className={`calc-btn ${button.className || ""}`}
              onClick={button.onClick}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="calculator-footer">
          <button
            type="button"
            className="secondary-btn"
            onClick={backspace}
            aria-label="Backspace"
          >
            <Delete size={16} />
            Backspace
          </button>
          <button type="button" className="primary-btn" onClick={handleUseResult}>
            Use this amount
          </button>
        </div>
      </div>
    </div>
  );
}