import { ENV } from "./env";

export interface EtsyReview {
  review_id: number;
  rating: number;
  review_text: string;
  title: string;
  reviewer_name: string;
  create_timestamp: number;
}

export async function fetchEtsyReviews(limit: number = 20): Promise<EtsyReview[]> {
  if (!ENV.etsyShopId || !ENV.etsyApiKey) {
    console.log("Etsy API not configured");
    return [];
  }

  try {
    const url = new URL(
      `https://api.etsy.com/v3/application/shops/${ENV.etsyShopId}/reviews`
    );
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("sort_order", "descending");

    const response = await fetch(url.toString(), {
      headers: {
        "x-api-key": ENV.etsyApiKey,
      },
    });

    if (!response.ok) {
      console.error(`Etsy API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as { results?: EtsyReview[] };
    return data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch Etsy reviews:", error);
    return [];
  }
}
