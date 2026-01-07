"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, Bed, Bath, Maximize, Navigation } from "lucide-react";

// Type for property details from the API
export interface PropertyDetails {
  images?: string[];
  image?: string;
  title?: string;
  address?: string;
  price?: string;
  url?: string;
  link?: string;
  asset_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  coordinates?: [number, number];
  latitude?: number;
  longitude?: number;
}

interface PropertyPopupContentProps {
  isLoading: boolean;
  error: Error | null;
  property: PropertyDetails | undefined;
  fallbackPrice: string;
}

/**
 * Fetch property details from the API
 */
export async function fetchPropertyDetails(platformHash: string): Promise<PropertyDetails> {
  const response = await fetch(`/api/metasearch-property?platform_hash=${platformHash}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch property details");
  }

  return response.json();
}

/**
 * PropertyPopupContent - Displays property details in a popup
 * Handles loading, error, and success states
 */
export function PropertyPopupContent({
  isLoading,
  error,
  property,
  fallbackPrice,
}: PropertyPopupContentProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-64 h-48 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-64 p-4">
        <p className="text-sm text-destructive">Failed to load property details</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  // Success state - display property details
  const imageUrl = property?.images?.[0] || property?.image;
  const title = property?.title || property?.address || "Property";
  const price = property?.price || fallbackPrice;
  const url = property?.url || property?.link;

  return (
    <div className="w-64 p-0">
      {/* Property Image */}
      {imageUrl && (
        <div className="relative h-32 overflow-hidden rounded-t-md">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          {/* Price badge on image */}
          {price && (
            <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-sm font-bold text-foreground">{price}</span>
            </div>
          )}
        </div>
      )}

      {/* Property Details */}
      <div className="space-y-2 p-3">
        <div>
          {property?.asset_type && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {property.asset_type}
            </span>
          )}
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">{title}</h3>
        </div>

        {/* Property features with icons */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {property?.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="size-3.5" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property?.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="size-3.5" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property?.area && (
            <div className="flex items-center gap-1">
              <Maximize className="size-3.5" />
              <span>{property.area} m²</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {url && (
            <Button size="sm" className="flex-1 h-8" onClick={() => window.open(url, "_blank")}>
              <Navigation className="size-3.5 mr-1.5" />
              View Listing
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => {
              const coords = property?.coordinates;
              if (coords) {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`,
                  "_blank"
                );
              }
            }}
          >
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

