import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from "react";
import { Box } from "@mui/material";
import SearchBox from "./SearchBox";
import { useWatchlist } from "../../hooks/useWatchlist";
import WatchlistItem from "./WatchlistItem";
import WatchlistManager from "./WatchlistManager";
import { getQuote } from "../../hooks/api";
import { isMarketOpen } from "../../hooks/isMarketOpen";
import { useLivePriceContext } from "../../contexts/LivePriceContext";
import GeneralContext from "../../contexts/GeneralContext";

// Helper to enrich stock with live/base price
const enrichStock = (stock, price, basePrice) => {
  const change = price - basePrice;
  const percent = basePrice ? ((change / basePrice) * 100).toFixed(2) : "0.00";
  return {
    ...stock,
    price,
    basePrice,
    change: change.toFixed(2),
    percent: percent + "%",
    isDown: change < 0,
  };
};

const Watchlist = () => {
  const {
    watchlists,
    activeList,
    currentList,
    loading,
    error,
    setWatchlists,
    setActiveList,
    handleCreateNewWatchlist,
    handleDeleteList,
    handleDeleteStock,
    handleAddStock,
    handleRenameWatchlist,
    clearError,
  } = useWatchlist();

  const [pricesFetched, setPricesFetched] = useState(new Set());
    // NEW: Get subscribe and unsubscribe from the context
    const { livePrices, subscribe, unsubscribe } = useLivePriceContext();
    const { showAlert } = useContext(GeneralContext);

  const componentId = useRef("watchlist-component").current;

  const symbols = useMemo(() => currentList.map((s) => s.name), [currentList]);
  const marketOpen = useMemo(() => isMarketOpen(), []);

  // ✅ Debounced symbol subscription defined at the top level using useRef

  const updateWatchlistPrices = useCallback(
    (updatedList) => {
      const currentRaw = JSON.stringify(watchlists[activeList] || []);
      const updatedRaw = JSON.stringify(updatedList);
      if (currentRaw !== updatedRaw) {
        setWatchlists((prev) => ({ ...prev, [activeList]: updatedList }));
      }
    },
    [activeList, setWatchlists, watchlists]
  );
  useEffect(() => {
    if (marketOpen && symbols.length > 0) {
      subscribe(componentId, symbols);
    }
    // CRUCIAL: Cleanup function to unsubscribe when component unmounts or symbols change
    return () => {
      unsubscribe(componentId);
    };
  }, [symbols, marketOpen, subscribe, unsubscribe, componentId]);
  
  useEffect(() => {
    const fetchInitialPrices = async () => {
      if (currentList.length === 0) return;

      const newSymbols = currentList.filter(
        (stock) => !pricesFetched.has(stock.name)
      );
      if (newSymbols.length === 0) return;

      try {
        const updatedStocks = await Promise.all(
          newSymbols.map(async (stock) => {
            try {
              await new Promise((r) => setTimeout(r, 100));
              const quote = await getQuote(stock.name);
              setPricesFetched((prev) => new Set(prev).add(stock.name));
              return enrichStock(
                stock,
                quote.data?.c ?? stock.price,
                quote.data?.pc ?? stock.price
              );
            } catch (err) {
              console.error(`Quote fetch failed for ${stock.symbol}:`, err);
              return stock;
            }
          })
        );

        const fullList = currentList.map(
          (stock) => updatedStocks.find((u) => u.name === stock.name) || stock
        );
        updateWatchlistPrices(fullList);
      } catch (error) {
        console.error("Failed to fetch stock prices:", error);
        showAlert?.("error", "Failed to fetch initial stock prices.");
      }
    };

    const timeoutId = setTimeout(fetchInitialPrices, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [activeList, currentList, pricesFetched, updateWatchlistPrices]);

  useEffect(() => {
    if (!marketOpen || Object.keys(livePrices).length === 0) return;

    let hasChanged = false;
    const updatedList = currentList.map((stock) => {
      const livePrice = livePrices[stock.name];
      if (livePrice === undefined || livePrice === stock.price) {
        return stock;
      }
      hasChanged = true;
      const basePrice = stock.basePrice || stock.price || livePrice;
      return enrichStock(stock, livePrice, basePrice);
    });

    if (hasChanged) {
      updateWatchlistPrices(updatedList);
    }
  }, [livePrices, currentList, updateWatchlistPrices, marketOpen]);

  useEffect(() => {
    setPricesFetched(new Set());
  }, [activeList]);
  return (
    <Box className="watchlist-container">
      <WatchlistManager
        watchlists={watchlists}
        activeList={activeList}
        loading={loading}
        error={error}
        onSetActiveList={setActiveList}
        onCreateWatchlist={handleCreateNewWatchlist}
        onDeleteWatchlist={handleDeleteList}
        onRenameWatchlist={handleRenameWatchlist}
        onClearError={clearError}
      />

      <SearchBox
        currentList={currentList}
        activeList={activeList}
        handleAddStock={handleAddStock}
      />

      <Box className="watchlist-items">
        {currentList.map((stock) => (
          <WatchlistItem
            key={stock._id}
            stock={stock}
            onDelete={() => handleDeleteStock(stock._id)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Watchlist;
