import { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import { getItems, postItem } from "../../shared/services/crudActions";
import { Plus, Eye, Trash2 } from "lucide-react";

type ProductDto = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  image?: string;
};

type SaleDetailDto = {
  id?: number;
  productId?: number;
  product?: ProductDto | null;
  unitPrice: number;
  quantity: number;
};

type SaleDto = {
  id?: number;
  date: string;
  clientIdentification: string;
  client?: ClientDto | null;
  value: number;
  quantity: number;
  saleStatusId: number;
  saleStatus?: SaleStatusDto | null;
  items: SaleDetailDto[];
};

type SaleStatusDto = {
  id: number;
  name: string;
};

type ClientDto = {
  identification: string;
  name?: string;
};

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
  const [sales, setSales] = useState<SaleDto[]>([]);
  const [statuses, setStatuses] = useState<SaleStatusDto[]>([]);
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [productsList, setProductsList] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"create" | "view" | null>(null);
  const [current, setCurrent] = useState<SaleDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsSale, setDetailsSale] = useState<SaleDto | null>(null);

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
    // simple mapping, adjust as needed
    switch (id) {
      case 1:
        return "bg-amber-400 text-black"; // Pendiente
      case 2:
        return "bg-green-500 text-white"; // Completado
      case 3:
        return "bg-red-500 text-white"; // Cancelado
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
      const data: ProductDto[] = await getItems("/Products");
      setProductsList(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const data: any = await getItems(apiBase);
      const items: SaleDto[] = Array.isArray(data)
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
      const data: SaleStatusDto[] = await getItems("/salestatus");
      setStatuses(data);
    } catch {}
  }

  async function fetchClients() {
    try {
      const data: ClientDto[] = await getItems("/clients");
      setClients(data);
    } catch {}
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

    const payload: SaleDto = {
      ...current,
      date: toIsoFromInput(formatForInput(current.date)),
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

  function updateItemState(idx: number, patch: Partial<SaleDetailDto>) {
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
        <div className="overflow-auto rounded-lg border border-slate-700">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-slate-800/60 text-slate-400">
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
                    className="text-left p-2 border-b border-slate-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{new Date(s.date).toLocaleString()}</td>
                  <td className="p-2">{s.clientIdentification}</td>
                  <td className="p-2">{formatCurrency(Number(s.value))}</td>
                  <td className="p-2">{s.quantity}</td>
                  <td className="p-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClasses(
                        s.saleStatusId
                      )}`}
                    >
                      {statuses.find((st) => st.id === s.saleStatusId)?.name ??
                        s.saleStatusId}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => {
                        setDetailsSale(s);
                        setShowDetailsModal(true);
                      }}
                      className="inline-flex items-center gap-2 text-sky-400 hover:underline"
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
              </label>

              <label className="flex flex-col text-sm">
                Estado
                {mode === "create" ? (
                  <input
                    className="mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1"
                    value={
                      statuses.find((st) => st.id === 1)?.name ?? "Pendiente"
                    }
                    disabled
                  />
                ) : (
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
                )}
              </label>

              <label className="flex flex-col text-sm">
                Valor
                <Input
                  type="number"
                  step="0.01"
                  value={String(current.value)}
                  disabled
                />
              </label>

              <label className="flex flex-col text-sm">
                Cantidad
                <Input
                  type="number"
                  value={String(current.quantity)}
                  disabled
                />
              </label>
            </div>

            {/* Items */}
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
