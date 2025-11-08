import { Plus } from "lucide-react";

interface ButtonAddProps {
  openCreateModal: () => void;
}

export const ButtonAdd = ({ openCreateModal }: ButtonAddProps) => {
  return (
    <button
      onClick={openCreateModal}
      className="fixed bottom-8 right-8 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition"
      aria-label="Agregar producto"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};
