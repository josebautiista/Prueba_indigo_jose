import React, { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
}

const apiBase = "/api/users";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<User>>({
    username: "",
    password: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiBase);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.username || !form.email || (!editingId && !form.password)) {
      setError("Completa username, email y password (al crear).");
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`${apiBase}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingId }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
      } else {
        const res = await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
      }
      await fetchUsers();
      resetForm();
    } catch (err) {
      setError("Error al guardar el usuario.");
      console.error(err);
    }
  }

  function resetForm() {
    setForm({ username: "", password: "", email: "" });
    setEditingId(null);
    setError(null);
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setForm({ username: user.username, email: user.email, password: "" });
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (err) {
      setError("Error al eliminar el usuario.");
      console.error(err);
    }
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h2 className="text-2xl font-semibold mb-6">Gestión de Usuarios</h2>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium">
            {editingId ? "Editar usuario" : "Crear usuario"}
          </h3>
          <button onClick={openCreateModal} className="text-sm text-blue-600">
            Crear en modal +
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              name="username"
              value={form.username ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              name="email"
              value={form.email ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña{" "}
              {editingId && (
                <span className="text-xs text-gray-500">
                  (dejar vacío para no cambiar)
                </span>
              )}
            </label>
            <Input
              name="password"
              type="password"
              value={form.password ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2 flex gap-3">
            <Button type="submit" variant="primary">
              {editingId ? "Actualizar" : "Crear"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </form>
        {error && <div className="text-red-600 mt-3">{error}</div>}
      </section>

      <section>
        <h3 className="text-xl font-medium mb-4">Lista de usuarios</h3>
        {loading ? (
          <div>Cargando...</div>
        ) : users.length === 0 ? (
          <div>No hay usuarios.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-md">
              <thead className="bg-gray-100">
                <tr>
                  {["ID", "Username", "Email", "Password", "Acciones"].map(
                    (head) => (
                      <th
                        key={head}
                        className="text-left px-4 py-2 border-b border-gray-200 font-semibold text-sm text-gray-700"
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 transition border-b border-gray-100"
                  >
                    <td className="px-4 py-2">{u.id}</td>
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">•••••••</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => startEdit(u)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <div className="fixed right-6 bottom-6 z-40">
        <button
          onClick={openCreateModal}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg hover:bg-blue-700"
          aria-label="Crear usuario"
        >
          +
        </button>
      </div>

      <Modal
        isOpen={showModal}
        title={editingId ? "Editar usuario" : "Nuevo usuario"}
        onClose={() => setShowModal(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={(e: any) => handleSubmit(e)}>
              {editingId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        }
      >
        <form className="grid gap-3">
          <Input
            name="username"
            value={form.username ?? ""}
            onChange={handleChange}
            placeholder="Username"
          />
          <Input
            name="email"
            value={form.email ?? ""}
            onChange={handleChange}
            placeholder="Email"
          />
          <Input
            name="password"
            type="password"
            value={form.password ?? ""}
            onChange={handleChange}
            placeholder="Password"
          />
        </form>
      </Modal>
    </div>
  );
}
