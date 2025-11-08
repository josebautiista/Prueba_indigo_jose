import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import Modal from "../../shared/components/Modal";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import {
  getItems,
  postItem,
  updateItem,
  deleteItem,
} from "../../shared/services/crudActions";
import { ButtonAdd } from "../../shared/components/ButtonAdd";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
};

const apiBase = "/Products";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formProduct, setFormProduct] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    stock: 0,
    image: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res: Product[] = await getItems(apiBase);
      setProducts(res);
    } catch (err: any) {
      setError(err.message ?? "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormProduct((p) => ({
      ...p,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateItem(`${apiBase}/${editingId}`, editingId, formProduct);
      } else {
        await postItem(apiBase, formProduct);
      }

      setShowModal(false);
      setEditingId(null);
      setFormProduct({ name: "", price: 0, stock: 0, image: "" });
      await fetchProducts();
    } catch (err: any) {
      alert(err.message ?? "Error al guardar el producto");
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteItem(`${apiBase}`, id);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormProduct({ name: "", price: 0, stock: 0, image: "" });
    setShowModal(true);
  }

  function openEditModal(p: Product) {
    setEditingId(p.id);
    setFormProduct({
      name: p.name,
      price: p.price,
      stock: p.stock,
      image: p.image ?? "",
    });
    setShowModal(true);
  }

  return (
    <div className=" mx-auto font-sans">
      <ButtonAdd openCreateModal={openCreateModal} />

      {loading && <div className="text-gray-600">Cargando productos...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="text-gray-500 italic">
          No hay productos registrados aún.
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full text-white border-collapse text-sm">
            <thead className=" text-white uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Imagen</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3 w-24">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 object-contain mx-auto"
                      />
                    ) : (
                      <div className="text-white text-xs text-center">
                        Sin imagen
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3 text-right text-white">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-white">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 cursor-pointer" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        title={editingId ? "Editar Producto" : "Nuevo Producto"}
        onClose={() => setShowModal(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="danger" onClick={() => setShowModal(false)}>
              <div className="flex items-center justify-center gap-2">
                <X className="w-4 h-4 mr-1" /> Cancelar
              </div>
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              <div className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4 mr-1" />{" "}
                {editingId ? "Guardar cambios" : "Crear"}
              </div>
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Input
            name="name"
            label="Nombre del producto"
            placeholder="Nombre del producto"
            value={formProduct.name}
            onChange={handleChange}
            required
          />
          <Input
            name="price"
            label="Precio"
            type="number"
            step="0.01"
            placeholder="Precio"
            value={String(formProduct.price)}
            onChange={handleChange}
            required
          />
          <Input
            name="stock"
            label="Stock disponible"
            type="number"
            placeholder="Stock disponible"
            value={String(formProduct.stock)}
            onChange={handleChange}
          />
          <Input
            name="image"
            label="URL de imagen (opcional)"
            placeholder="URL de imagen (opcional)"
            value={formProduct.image ?? ""}
            onChange={handleChange}
          />
        </form>
      </Modal>
    </div>
  );
}
