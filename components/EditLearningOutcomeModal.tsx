"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  CreateLearningOutcomeRequest,
  LearningOutcome,
  LearningOutcomesService,
  LEARNING_OUTCOME_TYPES,
} from "@/lib/learning-outcomes";
import NotificationService from "@/lib/notifications";

interface EditLearningOutcomeModalProps {
  isOpen: boolean;
  outcome: LearningOutcome | null;
  onClose: () => void;
  onOutcomeUpdated: () => void;
}

export default function EditLearningOutcomeModal({
  isOpen,
  outcome,
  onClose,
  onOutcomeUpdated,
}: EditLearningOutcomeModalProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    tipo: "GENERAL" as "GENERAL" | "ESPECIFICO",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && outcome) {
      setFormData({
        codigo: outcome.codigo || "",
        descripcion: outcome.descripcion || "",
        tipo: outcome.tipo || "GENERAL",
      });
    }
  }, [isOpen, outcome]);

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!outcome?.id) {
      NotificationService.error(
        "Error",
        "No se encontró el ID del resultado de aprendizaje."
      );
      return;
    }

    try {
      setIsLoading(true);

      // Obtener carreraId directamente del usuario en localStorage
      let carreraId: number | null = null;
      try {
        const rawUser = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
        if (rawUser) {
          const parsedUser = JSON.parse(rawUser);
          carreraId = parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
        }
      } catch (e) {
        // Silenciar error de acceso/parsing
      }

      if (!carreraId) {
        NotificationService.error(
          "Error de usuario",
          "No se encontró la carrera asociada al usuario."
        );
        return;
      }

      const payload: CreateLearningOutcomeRequest = {
        ...formData,
        carreraId,
      };

      const errors = LearningOutcomesService.validateLearningOutcome(payload);
      if (errors.length > 0) {
        NotificationService.warning("Datos inválidos", errors.join(", "));
        return;
      }

      await LearningOutcomesService.updateLearningOutcome(outcome.id, payload);

      NotificationService.success(
        "Resultado actualizado",
        `El resultado ${formData.codigo} ha sido actualizado exitosamente.`
      );

      onClose();
      onOutcomeUpdated();
    } catch (error) {
      console.error("Error actualizando resultado:", error);
      NotificationService.error(
        "Error al actualizar resultado",
        error instanceof Error ? error.message : "Ha ocurrido un error inesperado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !outcome) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-montserrat">
              Editar Resultado de Aprendizaje
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-open-sans">
              Actualiza el código, tipo y descripción del resultado.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-open-sans">
              Código *
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="RAXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent font-open-sans"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-open-sans">
              Tipo *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipo: e.target.value as "GENERAL" | "ESPECIFICO",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent font-open-sans"
              disabled={isLoading}
            >
              {LEARNING_OUTCOME_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-open-sans">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción detallada del resultado de aprendizaje..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent font-open-sans resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] disabled:opacity-50 disabled:cursor-not-allowed font-open-sans"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !formData.codigo.trim() ||
              !formData.descripcion.trim()
            }
            className="px-4 py-2 text-sm font-medium text-white bg-[#003366] border border-transparent rounded-md shadow-sm hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] disabled:opacity-50 disabled:cursor-not-allowed font-open-sans"
          >
            {isLoading ? "Actualizando..." : "Actualizar Resultado"}
          </button>
        </div>
      </div>
    </div>
  );
}
