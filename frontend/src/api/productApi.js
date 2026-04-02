import api from "./axios";

export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.category) params.append("category", filters.category);
  if (filters.q) params.append("q", filters.q);
  if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.inStock) params.append("inStock", "true");
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  const { data } = await api.get(`/products?${params.toString()}`);
  console.log("Fetched products with filters:", filters, data);
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  console.log(data);
  return data;
};

export const addProduct = async (productData) => {
  const formData = new FormData();
  formData.append("name", productData.name);
  formData.append("price", String(productData.price));
  formData.append("countInStock", String(productData.countInStock));
  formData.append("description", productData.description);
  formData.append("category", productData.category);
  formData.append("image", productData.image);

  const { data } = await api.post("/products/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
