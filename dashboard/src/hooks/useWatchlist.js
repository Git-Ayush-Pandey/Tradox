import { useState, useEffect } from "react";
import {
  fetchWatchlists,
  deleteStock,
  addStock,
  createWatchlist,
  deleteWatchlist,
  renameWatchlist,
} from "../hooks/api";

export const useWatchlist = () => {
  const [watchlists, setWatchlists] = useState({});
  const [activeList, setActiveList] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleCreateNewWatchlist = async (customName = null) => {
    const newName = customName || getNextName();
    setLoading(true);
    setError(null);

    try {
      const response = await createWatchlist(newName);

      if (response.data.success) {
        setWatchlists((prev) => ({ ...prev, [newName]: [] }));
        setActiveList(newName);
        return { success: true, listName: newName };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create watchlist";
      setError(errorMessage);
      console.error("Error creating watchlist:", error);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

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
        const updated = { ...watchlists };
        delete updated[listName];

        const nextList =
          listName === activeList ? Object.keys(updated)[0] : activeList;

        setWatchlists(updated);
        setActiveList(nextList);

        return { success: true, deletedCount: response.data.deletedCount };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete watchlist";
      setError(errorMessage);
      console.error("Error deleting watchlist:", error);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async (id) => {
    setError(null);

    try {
      await deleteStock(id);

      setWatchlists((prev) => {
        const updatedList = prev[activeList].filter((s) => s._id !== id);
        return { ...prev, [activeList]: updatedList };
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete stock";
      setError(errorMessage);
      console.error("Error deleting stock:", error);
      return { success: false, message: errorMessage };
    }
  };

  const handleAddStock = async (stock) => {
    setError(null);

    try {
      const res = await addStock(stock);

      if (res.data?.success) {
        const returnedItem = res.data.item;

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
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      setError(errorMessage);
      console.error("Add Error:", error);
      return { success: false, message: errorMessage };
    }
  };

  const handleRenameWatchlist = async (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed)
      return { success: false, message: "Watchlist name cannot be empty" };
    if (trimmed === oldName)
      return { success: false, message: "New name must be different" };
    if (watchlists[trimmed])
      return { success: false, message: "Watchlist already exists" };

    setLoading(true);
    setError(null);

    setWatchlists((prev) => {
      const updated = { ...prev };
      updated[trimmed] = prev[oldName];
      delete updated[oldName];
      return updated;
    });
    if (activeList === oldName) setActiveList(trimmed);

    try {
      const res = await renameWatchlist(oldName, trimmed);
      if (res.data?.success) {
        return { success: true, message: res.data.message };
      } else {
        await loadWatchlists();
        return {
          success: false,
          message: res.data?.message || "Rename failed",
        };
      }
    } catch (err) {
      await loadWatchlists();
      const msg = err.response?.data?.message || "Failed to rename watchlist";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const currentList = watchlists[activeList] || [];
  return {
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
    loadWatchlists,

    clearError: () => setError(null),
  };
};
