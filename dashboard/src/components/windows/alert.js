// Existing functional Alert component
const Alert = ({ type, message }) => {
  const colors = {
    success: "#d4edda",
    error: "#f8d7da",
    warning: "#fff3cd",
  };

  const borders = {
    success: "#c3e6cb",
    error: "#f5c6cb",
    warning: "#ffeeba",
  };

  const text = {
    success: "#155724",
    error: "#721c24",
    warning: "#856404",
  };

  return (
    <div
      style={{
        backgroundColor: colors[type],
        border: `1px solid ${borders[type]}`,
        color: text[type],
        padding: "10px 16px",
        borderRadius: "4px",
        marginBottom: "12px",
        fontSize: "0.85rem",
      }}
    >
      {message}
    </div>
  );
};

// Alert utility function (like toast-based)
export const showAlert = (type, message) => {
  // example placeholder – or leave empty if unused
  console.warn("showAlert called:", type, message);
};

// 🔧 This makes both `Alert` (default export) and `showAlert` (named export) usable
export default Alert;
