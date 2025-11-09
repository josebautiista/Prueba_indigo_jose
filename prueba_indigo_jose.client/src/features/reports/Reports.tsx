import { useEffect, useState } from "react";
import { getItems } from "../../shared/services/crudActions";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import type { Sale } from "../../shared/types/d.types";

function parseIso(d: string) {
  return new Date(d);
}

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [filtered, setFiltered] = useState<Sale[]>([]);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    try {
      const data: any = await getItems("/Sales");
      const items: Sale[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setSales(items);
      setFiltered(items);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilter() {
    if (!start && !end) {
      setFiltered(sales);
      return;
    }

    const s = start ? new Date(start) : new Date("1970-01-01");
    const e = end ? new Date(end) : new Date("9999-12-31");

    const f = sales.filter((x) => {
      const d = parseIso(x.date);
      return d >= s && d <= e;
    });
    setFiltered(f);
  }

  function totalValue(items: Sale[]) {
    return items.reduce((s, it) => s + Number(it.value || 0), 0);
  }

  function totalQuantity(items: Sale[]) {
    return items.reduce((s, it) => s + Number(it.quantity || 0), 0);
  }

  return (
    <div className="text-slate-100">
      <h3 className="text-lg font-semibold mb-3">
        Reportes — Ventas por periodo
      </h3>

      <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 mb-4">
        <div className="flex gap-3 flex-wrap items-end">
          <label className="flex flex-col text-sm">
            Desde
            <Input
              type="date"
              value={start}
              onChange={(e: any) => setStart(e.target.value)}
            />
          </label>

          <label className="flex flex-col text-sm">
            Hasta
            <Input
              type="date"
              value={end}
              onChange={(e: any) => setEnd(e.target.value)}
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="danger"
              onClick={() => {
                setStart("");
                setEnd("");
                setFiltered(sales);
              }}
            >
              Limpiar
            </Button>
            <Button variant="primary" onClick={applyFilter}>
              Aplicar
            </Button>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="bg-slate-800/30 p-3 rounded">
            <div className="text-xs text-slate-400">Ventas</div>
            <div className="font-semibold text-lg">{filtered.length}</div>
          </div>
          <div className="bg-slate-800/30 p-3 rounded">
            <div className="text-xs text-slate-400">Total valor</div>
            <div className="font-semibold text-lg">
              ${totalValue(filtered).toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-800/30 p-3 rounded">
            <div className="text-xs text-slate-400">Total cantidad</div>
            <div className="font-semibold text-lg">
              {totalQuantity(filtered)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-linear-to-r from-slate-800 to-slate-900 border-b border-slate-700">
            <tr>
              {["Id", "Fecha", "Cliente", "Valor", "Cantidad", "Estado"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-slate-300 font-semibold text-sm uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-400">
                  No hay ventas en el periodo seleccionado
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
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
                  <td className="px-6 py-4">${Number(s.value).toFixed(2)}</td>
                  <td className="px-6 py-4">{s.quantity}</td>
                  <td className="px-6 py-4">{s.saleStatusId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
