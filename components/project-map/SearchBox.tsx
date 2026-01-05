"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { useMapController } from "./useMapController";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";

type SearchResult = { display_name: string; lat: string; lon: string };

export function SearchBox() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { focusLatLng } = useMapController();
  const { data: searchResults = [], isFetching } = useQuery<SearchResult[]>({
    queryKey: ["geocode", debouncedQuery],
    enabled: debouncedQuery.trim().length >= 2,
    queryFn: async () => {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery.trim())}`, {
        headers: { "Accept": "application/json" },
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const handleSelect = (item: SearchResult) => {
    setSearchQuery(item.display_name);
    focusLatLng(parseFloat(item.lat), parseFloat(item.lon));
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative w-full">
      <Input
        placeholder={t("common.map.searchPlaceholder") as string}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-10"
      />
      {searchQuery ? (
        <button
          type="button"
          aria-label={t("common.clear") as string}
          className="absolute inset-y-0 right-2 flex items-center text-lg text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          x
        </button>
      ) : null}
      {searchQuery && searchResults.length > 0 ? (
        <div className="absolute z-[1100] mt-1 w-full rounded-md border bg-background shadow-lg max-h-52 overflow-auto">
          {searchResults.map((r, idx) => (
            <button
              key={`${r.lat}-${r.lon}-${idx}`}
              className="block w-full text-left px-3 py-2 hover:bg-muted text-foreground text-xs"
              onClick={() => handleSelect(r)}
            >
              {r.display_name}
            </button>
          ))}
        </div>
      ) : null}
      {searchQuery && isFetching && searchResults.length === 0 ? (
        <div className="absolute z-[1100] mt-1 w-full rounded-md border bg-background shadow-lg px-3 py-2 text-xs text-muted-foreground">
          {t("common.map.searching")}
        </div>
      ) : null}
    </div>
  );
}
