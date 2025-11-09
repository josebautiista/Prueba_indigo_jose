import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import Modal from "../../shared/components/Modal";
import { Pencil, Trash2, X, Save } from "lucide-react";
import {
  getItems,
  postItem,
  updateItem,
  deleteItem,
} from "../../shared/services/crudActions";
import { ButtonAdd } from "../../shared/components/ButtonAdd";
import type { Product } from "../../shared/types/d.types";

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
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-linear-to-r from-slate-800 to-slate-900 border-b border-slate-700">
              <tr>
                {["ID", "Imagen", "Nombre", "Precio", "Stock", "Acciones"].map(
                  (head) => (
                    <th
                      key={head}
                      className="text-left px-6 py-4 text-slate-300 font-semibold text-sm uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="transition-all duration-200 hover:bg-slate-800/30"
                >
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">{`#${p.id}`}</td>
                  <td className="px-6 py-4 w-24">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 object-contain mx-auto"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs text-center">
                        Sin imagen
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-200">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300">
                    {p.stock}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="flex items-center gap-2 px-3 py-2 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-all duration-200"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
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
