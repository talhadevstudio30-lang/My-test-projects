import { FixedSizeGrid } from "react-window";
function App() {
  // Create 200 colorful cards
  const cards = Array.from({ length: 20000 }, (_, index) => ({
    id: index + 1,
    color: `hsl(${(index * 37) % 360}, 80%, 60%)`,
  }));

  const columnCount = 4;
  const rowCount = Math.ceil(cards.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;

    if (index >= cards.length) return null;

    const card = cards[index];

    return (
      <div
        style={{
          ...style,
          padding: "12px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "16px",
            background: card.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "22px",
            fontWeight: "bold",
            boxShadow: "0 10px 25px rgba(0,0,0,.2)",
            transition: "0.3s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Card {card.id}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={250}
        height={700}
        rowCount={rowCount}
        rowHeight={180}
        width={1050}
      >
        {Cell}
      </FixedSizeGrid>
    </div>
  );
}

export default App;