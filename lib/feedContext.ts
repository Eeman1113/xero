"use client";
import { createContext, useContext } from "react";
import type { SiteFeed } from "./feedTypes";

/** The build-time episode feed, shared by the story (ch6 card backs) and the Listen section. */
export const FeedContext = createContext<SiteFeed | null>(null);
export const useFeed = () => useContext(FeedContext);
