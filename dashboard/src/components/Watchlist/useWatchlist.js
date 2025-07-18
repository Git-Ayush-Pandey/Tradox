import { useState, useEffect } from "react";
import { fetchWatchlists, deleteStock, addStock } from "../hooks/api";

export const useWatchlist = () => {
  const [watchlists, setWatchlists] = useState({});
  const [activeList, setActiveList] = useState("");

  useEffect(() => {
    fetchWatchlists()
      .then((res) => {
        const data = res.data;
        const first = Object.keys(data)[0] || "Watchlist 1";
        setWatchlists(data);
        setActiveList(first);
      })
      .catch(console.error);
  }, []);

  const getNextName = () => {
    let i = 1;
    while (`Watchlist ${i}` in watchlists) i++;
    return `Watchlist ${i}`;
  };

  const handleCreateNewWatchlist = () => {
    const newName = getNextName();
    setWatchlists((prev) => ({ ...prev, [newName]: [] }));
    setActiveList(newName);
  };
  const handleDeleteList = () => {
    const updated = { ...watchlists };
    delete updated[activeList];
    const next = Object.keys(updated)[0] || getNextName();
    if (!updated[next]) updated[next] = [];
    setWatchlists(updated);
    setActiveList(next);
  };

  const handleDeleteStock = (id) => {
    deleteStock(id).then(() => {
      setWatchlists((prev) => {
        const updatedList = prev[activeList].filter((s) => s._id !== id);
        return { ...prev, [activeList]: updatedList };
      });
    });
  };

  const handleAddStock = async (stock) => {
    return await addStock(stock)
      .then((res) => {
        if (res.data?.success) {
          setWatchlists((prev) => {
            const updatedList = [...(prev[activeList] || []), res.data.item];
            const newWatchlists = { ...prev, [activeList]: updatedList };
            console.log(newWatchlists);
            return newWatchlists;
          });
          return { success: true };
        } else {
          return {
            success: false,
            message: res.data?.message || "Failed to add",
          };
        }
      })
      .catch((err) => {
        console.error("Add Error:", err);
        return {
          success: false,
          message: err.response?.data?.message || "Something went wrong.",
        };
      });
  };

  const currentList = watchlists[activeList] || [];
  return {
    watchlists,
    activeList,
    currentList,
    setWatchlists,
    setActiveList,
    handleCreateNewWatchlist,
    handleDeleteList,
    handleDeleteStock,
    handleAddStock,
  };
};
