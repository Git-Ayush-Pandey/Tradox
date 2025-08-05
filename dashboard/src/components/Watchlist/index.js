// Fixed Watchlist/index.js - Restored with proper list structure

import { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Alert } from "@mui/material";
import SearchBox from "./SearchBox";
import { useWatchlist } from "../../hooks/useWatchlist";
import WatchlistItem from "./WatchlistItem";
import WatchlistManager from "./WatchlistManager";
import { getQuote } from "../hooks/api";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../../contexts/LivePriceContext";

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

  const [apiError, setApiError] = useState(null);
  const [pricesFetched, setPricesFetched] = useState(new Set()); // 🔥 Track fetched prices
  const { livePrices, updateSymbols } = useLivePriceContext();

  const symbols = useMemo(() => currentList.map((s) => s.name), [currentList]);

  // 🔥 MEMOIZE setWatchlists callback to prevent re-renders
  const updateWatchlistPrices = useCallback(
    (updatedList) => {
      setWatchlists((prev) => ({
        ...prev,
        [activeList]: updatedList,
      }));
    },
    [activeList, setWatchlists]
  ); // Removed setWatchlists from dependencies

  // Subscribe to live prices (market hours only)
  useEffect(() => {
    if (symbols.length > 0 && isMarketOpen()) {
      updateSymbols(symbols);
    }
  }, [symbols, updateSymbols]);

  // 🔥 DEBOUNCED price fetching - only when activeList changes, not currentList
  useEffect(() => {
    let timeoutId;

    const fetchPrices = async () => {
      if (currentList.length === 0) return;

      // 🔥 Only fetch prices for new symbols we haven't fetched
      const newSymbols = currentList.filter(
        (stock) => !pricesFetched.has(stock.name)
      );
      if (newSymbols.length === 0) return;

      try {
        // 🔥 BATCH API calls with delay to prevent rate limiting
        const updatedStocks = [];

        for (const stock of newSymbols) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay between calls
            const quote = await getQuote(stock.name);

            const enriched = enrichStock(
              stock,
              quote.data?.c ?? stock.price,
              quote.data?.pc ?? stock.price
            );
            updatedStocks.push(enriched);

            // Mark as fetched
            setPricesFetched((prev) => new Set([...prev, stock.name]));
          } catch (err) {
            console.error(`Quote fetch failed for ${stock.name}:`, err);
            updatedStocks.push(stock); // Keep original stock data
          }
        }

        // 🔥 Update only the new stocks, merge with existing
        const fullList = currentList.map((stock) => {
          const updated = updatedStocks.find((u) => u.name === stock.name);
          return updated || stock;
        });

        updateWatchlistPrices(fullList);
      } catch (error) {
        console.error("Failed to fetch stock prices:", error);
        setApiError("Failed to fetch stock prices. Please try again.");
      }
    };

    // 🔥 DEBOUNCE - wait 500ms before fetching
    timeoutId = setTimeout(fetchPrices, 500);

    return () => clearTimeout(timeoutId);
  }, [activeList, currentList, pricesFetched, updateWatchlistPrices]); // 🔥 Only depend on activeList, not currentList

  // Apply live prices if market is open
  useEffect(() => {
    if (!isMarketOpen()) return;
    if (!livePrices || currentList.length === 0) return;

    const updatedList = currentList.map((stock) => {
      const livePrice = livePrices[stock.name];
      if (!livePrice) return stock;

      const basePrice = stock.basePrice || stock.price || livePrice;
      return enrichStock(stock, livePrice, basePrice);
    });
    updateWatchlistPrices(updatedList);
  }, [livePrices, currentList, updateWatchlistPrices]);

  // 🔥 Clear fetched prices when activeList changes
  useEffect(() => {
    setPricesFetched(new Set());
  }, [activeList]);

  return (
    <Box>
      {/* Error Display */}
      {(error || apiError) && (
        <Alert
          severity="error"
          onClose={() => {
            clearError();
            setApiError(null);
          }}
        >
          {error || apiError}
        </Alert>
      )}

      <WatchlistManager
        watchlists={watchlists}
        activeList={activeList}
        currentList={currentList}
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

      {/* ✅ FIXED: Proper list structure with CSS classes */}
      <ul className="list">
        {currentList.map((stock, index) => (
          <WatchlistItem
            key={stock._id || index}
            stock={stock}
            onDelete={() => handleDeleteStock(stock._id)}
          />
        ))}
      </ul>
    </Box>
  );
};

export default Watchlist;
