import { supabase } from "@/integrations/supabase/client";

export type Variation = { name: string; options: string[] };

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  images: string[];
  variations: Variation[];
  is_offer: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  created_at: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
};

function normalizeProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    price: Number(row["price"] ?? 0),
    sale_price: row["sale_price"] == null ? null : Number(row["sale_price"]),
    images: (row["images"] as string[] | null) ?? [],
    variations: Array.isArray(row["variations"]) ? (row["variations"] as Variation[]) : [],
  };
}

export function finalPrice(product: Pick<Product, "price" | "sale_price">) {
  return product.sale_price != null && product.sale_price > 0
    ? product.sale_price
    : product.price;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>));
}

export async function fetchProductByCode(code: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProduct(data as Record<string, unknown>) : null;
}

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Banner[];
}

export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: fetchCategories,
};

export const productsQuery = {
  queryKey: ["products"],
  queryFn: fetchProducts,
};

export const bannersQuery = {
  queryKey: ["banners"],
  queryFn: fetchBanners,
};
