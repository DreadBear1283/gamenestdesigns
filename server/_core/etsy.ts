import { ENV } from "./env";

export interface EtsyReview {
  review_id: number;
  rating: number;
  review_text: string;
  title: string;
  reviewer_name: string;
  create_timestamp: number;
}

export interface EtsyConversation {
  conversation_id: number;
  buyer_user_id: number;
  buyer_display_name: string;
  last_message_text: string;
  last_message_time: number;
}

export interface EtsyMessage {
  message_id: number;
  conversation_id: number;
  user_id: number;
  message: string;
  create_timestamp: number;
}

export interface EtsySalesData {
  total_sales: number;
  total_revenue: number;
  order_count: number;
  item_count: number;
}

async function fetchEtsyApi(endpoint: string, method: string = "GET", body?: any) {
  if (!ENV.etsyShopId || !ENV.etsyApiKey) {
    throw new Error("Etsy API not configured");
  }

  const url = `https://api.etsy.com/v3/application/shops/${ENV.etsyShopId}${endpoint}`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "x-api-key": ENV.etsyApiKey,
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Etsy API ${response.status}:`, errorText);
      throw new Error(`Etsy API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Etsy API request failed for ${url}:`, error);
    throw error;
  }
}

export async function fetchEtsyReviews(limit: number = 20): Promise<EtsyReview[]> {
  try {
    const data = await fetchEtsyApi(`/reviews?limit=${limit}&sort_order=descending`);
    return data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch Etsy reviews:", error);
    return [];
  }
}

export async function fetchEtsyConversations(limit: number = 50): Promise<EtsyConversation[]> {
  try {
    const data = await fetchEtsyApi(`/conversations?limit=${limit}&sort_order=descending`);
    return data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch Etsy conversations:", error);
    return [];
  }
}

export async function fetchEtsyConversationMessages(conversationId: number): Promise<EtsyMessage[]> {
  try {
    const data = await fetchEtsyApi(`/conversations/${conversationId}`);
    return data.messages ?? [];
  } catch (error) {
    console.error("Failed to fetch Etsy conversation messages:", error);
    return [];
  }
}

export async function sendEtsyMessage(conversationId: number, message: string): Promise<void> {
  try {
    await fetchEtsyApi(`/conversations/${conversationId}`, "POST", { message });
  } catch (error) {
    console.error("Failed to send Etsy message:", error);
    throw error;
  }
}

export async function fetchEtsyShopInfo(): Promise<any> {
  try {
    return await fetch("https://api.etsy.com/v3/application/shops/me", {
      method: "GET",
      headers: {
        "x-api-key": ENV.etsyApiKey,
        "Content-Type": "application/json",
      },
    }).then(r => {
      if (!r.ok) throw new Error(`Etsy API error: ${r.status}`);
      return r.json();
    });
  } catch (error) {
    console.error("Failed to fetch Etsy shop info:", error);
    throw error;
  }
}

export async function fetchEtsySalesData(): Promise<EtsySalesData> {
  try {
    const data = await fetchEtsyApi(`/stats`);
    return {
      total_sales: data.all_time_sales ?? 0,
      total_revenue: data.all_time_revenue ?? 0,
      order_count: 0,
      item_count: 0,
    };
  } catch (error) {
    console.error("Failed to fetch Etsy sales data:", error);
    return { total_sales: 0, total_revenue: 0, order_count: 0, item_count: 0 };
  }
}

export async function fetchEtsyListings(limit: number = 100): Promise<any[]> {
  try {
    const data = await fetchEtsyApi(`/listings/active?limit=${limit}`);
    return data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch Etsy listings:", error);
    return [];
  }
}

export async function fetchEtsyOrders(limit: number = 100): Promise<any[]> {
  try {
    const data = await fetchEtsyApi(`/orders?limit=${limit}&sort_order=descending`);
    return data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch Etsy orders:", error);
    return [];
  }
}
