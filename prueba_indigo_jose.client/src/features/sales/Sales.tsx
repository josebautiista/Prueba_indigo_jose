import { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import { getItems, postItem } from "../../shared/services/crudActions";
import { Plus, Eye, Trash2 } from "lucide-react";
import type {
  Client,
  Product,
  SaleDetail,
  Sale,
  SaleStatus,
} from "../../shared/types/d.types";

const apiBase = "/Sales";

function formatForInput(dateIso: string) {
  const d = new Date(dateIso);
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

function toIsoFromInput(dtLocal: string) {
  if (!dtLocal) return new Date().toISOString();
  const d = new Date(dtLocal);
  return d.toISOString();
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [statuses, setStatuses] = useState<SaleStatus[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    identification: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"create" | "view" | null>(null);
  const [current, setCurrent] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsSale, setDetailsSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (!current) return;
    const totalQuantity =
      current.items?.reduce((s, it) => s + (it.quantity || 0), 0) ?? 0;
    const totalValue =
      current.items?.reduce(
        (s, it) => s + (it.unitPrice || 0) * (it.quantity || 0),
        0
      ) ?? 0;

    if (current.quantity !== totalQuantity || current.value !== totalValue) {
      setCurrent((c) =>
        c ? { ...c, quantity: totalQuantity, value: totalValue } : c
      );
    }
  }, [current?.items]);

  function formatCurrency(v: number) {
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
      }).format(v);
    } catch {
      return v.toFixed(2);
    }
  }

  function statusClasses(id: number) {
    switch (id) {
      case 1:
        return "bg-amber-400 text-black";
      case 2:
        return "bg-green-500 text-white";
      case 3:
        return "bg-red-500 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  }

  useEffect(() => {
    fetchAll();
    fetchStatuses();
    fetchClients();
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const data: Product[] = await getItems("/Products");
      setProductsList(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const data: any = await getItems(apiBase);
      const items: Sale[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setSales(items);
    } catch (err: any) {
      setError(err.message || "Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStatuses() {
    try {
      const data: SaleStatus[] = await getItems("/salestatus");
      setStatuses(data);
    } catch {}
  }

  async function fetchClients() {
    try {
      const data: Client[] = await getItems("/clients");
      setClients(data);
    } catch {}
  }

  async function createClient() {
    if (
      !newClient.identification ||
      !newClient.name ||
      !newClient.email ||
      !newClient.phone ||
      !newClient.address
    ) {
      setError("Completa todos los campos del cliente.");
      return;
    }

    try {
      await postItem("/clients", {
        identification: newClient.identification,
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
      });

      const created = {
        identification: newClient.identification,
        name: newClient.name,
      };
      setClients((c) => [...c, created]);
      setCurrent((cur) =>
        cur ? { ...cur, clientIdentification: newClient.identification } : cur
      );
      setNewClient({
        identification: "",
        name: "",
        phone: "",
        email: "",
        address: "",
      });
      setShowAddClientForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al crear el cliente");
    }
  }

  function openCreate() {
    setCurrent({
      date: new Date().toISOString(),
      clientIdentification: clients[0]?.identification ?? "",
      value: 0,
      quantity: 0,
      saleStatusId: 1,
      items: [],
    });
    setMode("create");
    setShowModal(true);
    setError(null);
  }

  async function save() {
    if (!current) return;
    setLoading(true);
    setError(null);

    const totalQuantity =
      current.items?.reduce((s, it) => s + (it.quantity || 0), 0) ?? 0;
    const totalValue =
      current.items?.reduce(
        (s, it) => s + (it.unitPrice || 0) * (it.quantity || 0),
        0
      ) ?? 0;

    const payload: Sale = {
      ...current,
      date:
        mode === "create"
          ? new Date().toISOString()
          : toIsoFromInput(formatForInput(current.date)),
      quantity: totalQuantity,
      value: totalValue,
    };

    try {
      await postItem(apiBase, payload);
      await fetchAll();
      setShowModal(false);
      setMode(null);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    if (!current) return;
    setCurrent({
      ...current,
      items: [
        ...(current.items ?? []),
        { productId: undefined, product: null, unitPrice: 0, quantity: 1 },
      ],
    });
  }

  function updateItemState(idx: number, patch: Partial<SaleDetail>) {
    if (!current) return;
    const items = current.items!.map((it, i) =>
      i === idx ? { ...it, ...patch } : it
    );
    setCurrent({ ...current, items });
  }

  function removeItem(idx: number) {
    if (!current) return;
    setCurrent({
      ...current,
      items: current.items!.filter((_, i) => i !== idx),
    });
  }

  return (
    <div className="p-4 text-slate-100">
      {error && (
        <div className="mb-4 text-red-400 bg-red-900/30 p-2 rounded">
          {error}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div />
        <div>
          <Button variant="primary" onClick={openCreate}>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Nueva venta</span>
            </div>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400">Cargando...</div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-linear-to-r from-slate-800 to-slate-900 border-b border-slate-700">
              <tr>
                {[
                  "Id",
                  "Fecha",
                  "Cliente",
                  "Valor",
                  "Cantidad",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-slate-300 font-semibold text-sm uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="transition-all duration-200 hover:bg-slate-800/30"
                >
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">
                    {s.id}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(s.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{s.clientIdentification}</td>
                  <td className="px-6 py-4">
                    {formatCurrency(Number(s.value))}
                  </td>
                  <td className="px-6 py-4">{s.quantity}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClasses(
                        s.saleStatusId
                      )}`}
                    >
                      {statuses.find((st) => st.id === s.saleStatusId)?.name ??
                        s.saleStatusId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setDetailsSale(s);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-2 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg px-3 py-2 transition-all duration-200"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline cursor-pointer">
                        Ver detalles
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400">
                    No hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        title={mode === "create" ? "Nueva venta" : "Venta"}
        onClose={() => setShowModal(false)}
        position={mode === "create" ? "top" : "center"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save}>
              Guardar
            </Button>
          </div>
        }
      >
        {current && (
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              {mode !== "create" && (
                <label className="flex flex-col text-sm">
                  Fecha
                  <Input
                    type="datetime-local"
                    value={formatForInput(current.date)}
                    onChange={(e: any) =>
                      setCurrent({
                        ...current,
                        date: toIsoFromInput(e.target.value),
                      })
                    }
                  />
                </label>
              )}

              <label className="flex flex-col text-sm">
                Cliente
                <select
                  value={current.clientIdentification}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      clientIdentification: e.target.value,
                    })
                  }
                  className="mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1"
                >
                  <option value="">-- seleccionar --</option>
                  {clients.map((c) => (
                    <option key={c.identification} value={c.identification}>
                      {c.name ?? c.identification}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="text-sm text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded px-2 py-1"
                    onClick={() => setShowAddClientForm((s) => !s)}
                  >
                    {showAddClientForm ? "Cancelar" : "Agregar cliente"}
                  </button>
                </div>
              </label>

              {showAddClientForm && (
                <div className="md:col-span-2 bg-slate-800/40 p-3 rounded space-y-2">
                  <div className="grid md:grid-cols-2 gap-2">
                    <Input
                      name="identification"
                      label="Identificación"
                      value={newClient.identification}
                      onChange={(e: any) =>
                        setNewClient({
                          ...newClient,
                          identification: e.target.value,
                        })
                      }
                    />
                    <Input
                      name="name"
                      label="Nombre"
                      value={newClient.name}
                      onChange={(e: any) =>
                        setNewClient({ ...newClient, name: e.target.value })
                      }
                    />
                    <Input
                      name="phone"
                      label="Teléfono"
                      value={newClient.phone}
                      onChange={(e: any) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                    />
                    <Input
                      name="email"
                      label="Email"
                      value={newClient.email}
                      onChange={(e: any) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                    />
                    <Input
                      name="address"
                      label="Dirección"
                      value={newClient.address}
                      onChange={(e: any) =>
                        setNewClient({ ...newClient, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddClientForm(false);
                        setNewClient({
                          identification: "",
                          name: "",
                          phone: "",
                          email: "",
                          address: "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={createClient}>
                      Crear cliente
                    </Button>
                  </div>
                </div>
              )}

              {mode !== "create" && (
                <label className="flex flex-col text-sm">
                  Estado
                  <select
                    value={current.saleStatusId}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        saleStatusId: Number(e.target.value),
                      })
                    }
                    className="mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1"
                  >
                    {statuses.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <label className="flex-1 flex flex-col text-sm">
                  Valor
                  {mode === "create" ? (
                    <div className="mt-1 text-lg font-semibold text-slate-200">
                      {formatCurrency(Number(current.value))}
                    </div>
                  ) : (
                    <Input
                      type="number"
                      step="0.01"
                      value={String(current.value)}
                      disabled
                    />
                  )}
                </label>

                <label className="flex-1 flex flex-col text-sm">
                  Cantidad
                  {mode === "create" ? (
                    <div className="mt-1 text-lg font-semibold text-slate-200">
                      {current.quantity}
                    </div>
                  ) : (
                    <Input
                      type="number"
                      value={String(current.quantity)}
                      disabled
                    />
                  )}
                </label>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items</h4>
              {current.items.length > 0 ? (
                <table className="w-full text-sm border border-slate-700 rounded-lg overflow-hidden">
                  <thead className="bg-slate-800/60 text-slate-400">
                    <tr>
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-left">Precio</th>
                      <th className="p-2 text-left">Cantidad</th>
                      <th className="p-2 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-slate-800">
                        <td className="p-2">
                          <select
                            className="mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 w-full"
                            value={it.productId ?? ""}
                            onChange={(e) => {
                              const pid = Number(e.target.value) || undefined;
                              const prod =
                                productsList.find((p) => p.id === pid) ?? null;
                              updateItemState(idx, {
                                productId: pid,
                                product: prod,
                                unitPrice: prod ? prod.price : it.unitPrice,
                              });
                            }}
                          >
                            <option value="">-- seleccionar producto --</option>
                            {productsList.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={String(it.unitPrice)}
                            onChange={(e: any) =>
                              updateItemState(idx, {
                                unitPrice: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={String(it.quantity)}
                            onChange={(e: any) =>
                              updateItemState(idx, {
                                quantity: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-red-400 hover:underline inline-flex items-center gap-2"
                            title="Eliminar item"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-slate-400">No hay items</div>
              )}
              <div className="mt-3">
                <Button variant="secondary" onClick={addItem}>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Agregar item</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDetailsModal}
        title={detailsSale ? `Detalles venta #${detailsSale.id}` : "Detalles"}
        onClose={() => setShowDetailsModal(false)}
        footer={
          <div className="flex justify-end">
            <Button variant="danger" onClick={() => setShowDetailsModal(false)}>
              Cerrar
            </Button>
          </div>
        }
      >
        {detailsSale ? (
          <div className="space-y-3">
            <div className="text-sm text-slate-400">
              Cliente:{" "}
              {detailsSale.client?.name ?? detailsSale.clientIdentification}
            </div>
            <table className="w-full text-sm border border-slate-700 rounded-lg overflow-hidden">
              <thead className="bg-slate-800/60 text-slate-400">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Imagen</th>
                  <th className="p-2 text-left">Precio unit.</th>
                  <th className="p-2 text-left">Cantidad</th>
                  <th className="p-2 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detailsSale.items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-800">
                    <td className="p-2">
                      {it.product?.name ?? `#${it.productId}`}
                    </td>
                    <td className="p-2">
                      {it.product?.image ? (
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="w-20 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-12 bg-slate-700 rounded" />
                      )}
                    </td>
                    <td className="p-2">{(it.unitPrice || 0).toFixed(2)}</td>
                    <td className="p-2">{it.quantity}</td>
                    <td className="p-2">
                      {((it.unitPrice || 0) * (it.quantity || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-slate-400">Sin detalles</div>
        )}
      </Modal>
    </div>
  );
}
