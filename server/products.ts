export function toStripeProductData(product: { name: string; description: string; imageUrls: readonly string[] | string[] }) {
  const images = Array.isArray(product.imageUrls)
    ? product.imageUrls.filter(url => typeof url === "string" && url.startsWith("http"))
    : [];

  return {
    name: product.name,
    description: product.description.slice(0, 400),
    images: images.slice(0, 8),
  };
}
