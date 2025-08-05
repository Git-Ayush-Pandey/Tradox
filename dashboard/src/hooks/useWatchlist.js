import { useState, useEffect } from "react";
import { 
  fetchWatchlists, 
  deleteStock, 
  addStock, 
  createWatchlist, 
  deleteWatchlist 
} from "../hooks/api";

export const useWatchlist = () => {
  const [watchlists, setWatchlists] = useState({});
  const [activeList, setActiveList] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load watchlists on mount
  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetchWatchlists();
      const data = res.data;
      const first = Object.keys(data)[0] || "Watchlist 1";
      
      setWatchlists(data);
      setActiveList(first);
    } catch (error) {
      console.error("Error loading watchlists:", error);
      setError("Failed to load watchlists");
      // Fallback to default watchlist
      setWatchlists({ "Watchlist 1": [] });
      setActiveList("Watchlist 1");
    } finally {
      setLoading(false);
    }
  };

  const getNextName = () => {
    let i = 1;
    while (`Watchlist ${i}` in watchlists) i++;
    return `Watchlist ${i}`;
  };

  // Enhanced: Create watchlist with backend sync
  const handleCreateNewWatchlist = async (customName = null) => {
    const newName = customName || getNextName();
    setLoading(true);
    setError(null);

    try {
      const response = await createWatchlist(newName);
      
      if (response.data.success) {
        // Update local state
        setWatchlists((prev) => ({ ...prev, [newName]: [] }));
        setActiveList(newName);
        return { success: true, listName: newName };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create watchlist";
      setError(errorMessage);
      console.error("Error creating watchlist:", error);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced: Delete watchlist with backend sync
  const handleDeleteList = async (listName = activeList) => {
    if (Object.keys(watchlists).length <= 1) {
      setError("Cannot delete your only watchlist");
      return { success: false, message: "Cannot delete your only watchlist" };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await deleteWatchlist(listName);
      
      if (response.data.success) {
        // Update local state
        const updated = { ...watchlists };
        delete updated[listName];
        
        // Switch to next available watchlist if we deleted the active one
        const nextList = listName === activeList 
          ? Object.keys(updated)[0] 
          : activeList;
        
        setWatchlists(updated);
        setActiveList(nextList);
        
        return { success: true, deletedCount: response.data.deletedCount };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete watchlist";
      setError(errorMessage);
      console.error("Error deleting watchlist:", error);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced: Delete stock with better error handling
  const handleDeleteStock = async (id) => {
    setError(null);
    
    try {
      await deleteStock(id);
      
      // Update local state
      setWatchlists((prev) => {
        const updatedList = prev[activeList].filter((s) => s._id !== id);
        return { ...prev, [activeList]: updatedList };
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete stock";
      setError(errorMessage);
      console.error("Error deleting stock:", error);
      return { success: false, message: errorMessage };
    }
  };

  // Enhanced: Add stock with better error handling
  const handleAddStock = async (stock) => {
    setError(null);
    
    try {
      const res = await addStock(stock);
      
      if (res.data?.success) {
        const returnedItem = res.data.item;
        
        // Update local state
        setWatchlists((prev) => {
          const updatedList = prev[activeList]
            ? [...prev[activeList], returnedItem]
            : [returnedItem];
          return { ...prev, [activeList]: updatedList };
        });
        
        return { success: true };
      } else {
        const message = res.data?.message || "Failed to add stock";
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong";
      setError(errorMessage);
      console.error("Add Error:", error);
      return { success: false, message: errorMessage };
    }
  };

  // Rename watchlist functionality
  const handleRenameWatchlist = async (oldName, newName) => {
  if (!newName || newName.trim().length === 0) {
    return { success: false, message: "Watchlist name cannot be empty" };
  }

  if (newName.trim() === oldName) {
    return { success: false, message: "New name must be different" };
  }

  if (watchlists[newName.trim()]) {
    return { success: false, message: "Watchlist with this name already exists" };
  }

  setLoading(true);
  setError(null);

  try {
    const trimmed = newName.trim();

    // ✅ Create new watchlist
    const createResult = await handleCreateNewWatchlist(trimmed);
    if (!createResult.success) {
      return createResult;
    }

    // ✅ Move all stocks
    const stocksToMove = watchlists[oldName] || [];
    for (const stock of stocksToMove) {
      const stockPayload = { ...stock, listName: trimmed };
      delete stockPayload._id;
      await addStock(stockPayload);
    }

    // ✅ Delete old watchlist
    await handleDeleteList(oldName);

    // ✅ Set new watchlist as active
    setActiveList(trimmed);

    return { success: true };
  } catch (error) {
    const errorMessage = "Failed to rename watchlist";
    setError(errorMessage);
    console.error("Error renaming watchlist:", error);
    return { success: false, message: errorMessage };
  } finally {
    setLoading(false);
  }
};


  const currentList = watchlists[activeList] || [];

  return {
    // State
    watchlists,
    activeList,
    currentList,
    loading,
    error,
    
    // Setters
    setWatchlists,
    setActiveList,
    
    // Actions
    handleCreateNewWatchlist,
    handleDeleteList,
    handleDeleteStock,
    handleAddStock,
    handleRenameWatchlist,
    loadWatchlists,
    
    // Utilities
    clearError: () => setError(null),
  };
};