import React, { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import {
  getItems,
  postItem,
  updateItem,
  deleteItem,
} from "../../shared/services/crudActions";
import {
  UserCircle,
  Mail,
  Lock,
  Pencil,
  Trash2,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { ButtonAdd } from "../../shared/components/ButtonAdd";

interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
}

const apiBase = "/users";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<User>>({
    username: "",
    password: "",
    email: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const data: User[] = await getItems(apiBase);
      setUsers(data);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "password") {
      if (value) {
        validatePassword(value);
        validatePasswordMatch(value, confirmPassword);
      } else {
        setPasswordError(null);
        setConfirmPasswordError(null);
      }
    }
  }

  function handleConfirmPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setConfirmPassword(value);
    validatePasswordMatch(form.password || "", value);
  }

  function validatePassword(password: string) {
    const requirements = [
      { regex: /.{8,}/, msg: "Mínimo 8 caracteres" },
      { regex: /[A-Z]/, msg: "Una mayúscula" },
      { regex: /\d/, msg: "Un número" },
      { regex: /[^A-Za-z0-9]/, msg: "Un carácter especial" },
    ];

    const failed = requirements.find((r) => !r.regex.test(password));
    setPasswordError(failed ? failed.msg : null);
    return !failed;
  }

  function validatePasswordMatch(password: string, confirmPassword: string) {
    if (!confirmPassword) {
      setConfirmPasswordError(null);
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return false;
    } else {
      setConfirmPasswordError(null);
      return true;
    }
  }

  function getPasswordStrength(password: string) {
    if (!password) return 0;
    const requirements = [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
    return requirements.filter((regex) => regex.test(password)).length;
  }

  async function handleSubmit(e: React.FormEvent) {
    console.log("llega");

    e.preventDefault();
    setError(null);

    if (!form.username || !form.email) {
      setError("Completa username y email.");
      return;
    }

    if (!editingId) {
      if (!form.password || !confirmPassword) {
        setError("Completa y confirma la contraseña.");
        return;
      }
    } else {
      if (form.password && !confirmPassword) {
        setError("Confirma la contraseña para actualizarla.");
        return;
      }
    }

    if (form.password) {
      if (!validatePassword(form.password)) {
        return;
      }
      if (!validatePasswordMatch(form.password, confirmPassword)) {
        return;
      }
    }
    try {
      if (editingId) {
        const payload = { ...(form as any), id: editingId };
        await updateItem(apiBase, editingId, payload);
      } else {
        await postItem(apiBase, form);
      }
      await fetchUsers();
      resetForm();
      setShowModal(false);
    } catch {
      setError("Error al guardar el usuario.");
    }
  }

  function resetForm() {
    setForm({ username: "", password: "", email: "" });
    setConfirmPassword("");
    setEditingId(null);
    setError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setForm({ username: user.username, email: user.email, password: "" });
    setConfirmPassword("");
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
    try {
      await deleteItem(apiBase, id);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch {
      setError("Error al eliminar el usuario.");
    }
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  const passwordStrength = getPasswordStrength(form.password || "");
  const passwordStrengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const passwordStrengthLabels = ["Muy débil", "Débil", "Media", "Fuerte"];

  return (
    <div className="mx-auto text-slate-100">
      <div className="flex items-center justify-between mb-8">
        <ButtonAdd openCreateModal={openCreateModal} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <section className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
            <UserCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              No hay usuarios registrados
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Crea el primer usuario haciendo clic en el botón "Agregar"
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-linear-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                <tr>
                  {["ID", "Usuario", "Email", "Acciones"].map((head) => (
                    <th
                      key={head}
                      className="text-left px-6 py-4 text-slate-300 font-semibold text-sm uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-all duration-200 hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-slate-400">
                      #{u.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 rounded-lg">
                          <UserCircle className="w-4 h-4 text-sky-400" />
                        </div>
                        <span className="font-medium">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Mail className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-slate-300">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="flex items-center gap-2 px-3 py-2 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-all duration-200"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
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
      </section>

      <Modal
        isOpen={showModal}
        title={editingId ? "Editar usuario" : "Crear nuevo usuario"}
        onClose={() => setShowModal(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!!passwordError || !!confirmPasswordError}
              className="px-6"
            >
              {editingId ? "Actualizar" : "Crear usuario"}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre de usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-sky-400" />
              </div>
              <Input
                name="username"
                value={form.username ?? ""}
                onChange={handleChange}
                placeholder="Ingresa el nombre de usuario"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-emerald-400" />
              </div>
              <Input
                name="email"
                type="email"
                value={form.email ?? ""}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-amber-400" />
              </div>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password ?? ""}
                onChange={handleChange}
                placeholder="Ingresa la contraseña"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>

            {form.password && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    Seguridad de la contraseña:
                  </span>
                  <span
                    className={`${
                      passwordStrength >= 3
                        ? "text-green-400"
                        : passwordStrength >= 2
                        ? "text-yellow-400"
                        : "text-red-400"
                    } font-medium`}
                  >
                    {passwordStrengthLabels[passwordStrength - 1] ||
                      "Muy débil"}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrengthColors[passwordStrength - 1] ||
                      "bg-red-500"
                    }`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {(!editingId || !!form.password) && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-amber-400" />
                </div>
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirma la contraseña"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Requisitos de la contraseña:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { regex: /.{8,}/, text: "Mínimo 8 caracteres" },
                { regex: /[A-Z]/, text: "Una letra mayúscula" },
                { regex: /\d/, text: "Un número" },
                { regex: /[^A-Za-z0-9]/, text: "Un carácter especial" },
              ].map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  {form.password && req.regex.test(form.password) ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-500" />
                  )}
                  <span
                    className={
                      form.password && req.regex.test(form.password)
                        ? "text-green-400"
                        : "text-slate-400"
                    }
                  >
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
              <XCircle className="w-4 h-4" />
              {passwordError}
            </div>
          )}

          {confirmPasswordError && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
              <XCircle className="w-4 h-4" />
              {confirmPasswordError}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
