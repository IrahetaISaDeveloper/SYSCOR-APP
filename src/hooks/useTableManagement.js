import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import {
  fetchAllTables,
  createTable,
  updateTableFull,
  deleteTableById,
} from "../services/tablesApi";

export default function useTableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null); // null = modo crear

  const [formNumber, setFormNumber] = useState("");
  const [formStatus, setFormStatus] = useState("libre");
  const [submitting, setSubmitting] = useState(false);

  const loadTables = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllTables();
      setTables(data.sort((a, b) => a.number - b.number));
      setError(null);
    } catch (err) {
      console.error("useTableManagement.loadTables:", err);
      setError("No se pudieron cargar las mesas");
    } finally {
      setLoading(false);
    }
  }, []);

  const openManagement = useCallback(() => {
    setModalVisible(true);
    loadTables();
  }, [loadTables]);

  const closeManagement = useCallback(() => {
    setModalVisible(false);
    setFormVisible(false);
    setEditingTable(null);
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingTable(null);
    setFormNumber("");
    setFormStatus("libre");
    setFormVisible(true);
  }, []);

  const openEditForm = useCallback((table) => {
    setEditingTable(table);
    setFormNumber(String(table.number));
    setFormStatus(table.status);
    setFormVisible(true);
  }, []);

  const cancelForm = useCallback(() => {
    setFormVisible(false);
    setEditingTable(null);
  }, []);

  const submitForm = useCallback(async () => {
    const numberValue = Number(formNumber);
    if (!formNumber.trim() || Number.isNaN(numberValue) || numberValue <= 0) {
      Alert.alert("Número inválido", "Ingresa un número de mesa válido.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTable) {
        await updateTableFull(editingTable._id, { number: numberValue, status: formStatus });
      } else {
        await createTable({ number: numberValue, status: formStatus });
      }
      setFormVisible(false);
      setEditingTable(null);
      await loadTables();
    } catch (err) {
      console.error("useTableManagement.submitForm:", err);
      const message = err.response?.data?.message || "No se pudo guardar la mesa. Intenta de nuevo.";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  }, [formNumber, formStatus, editingTable, loadTables]);

  const removeTable = useCallback(
    (table) => {
      Alert.alert(
        "Eliminar mesa",
        `¿Seguro que quieres eliminar la Mesa ${table.number}? Esta acción no se puede deshacer.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteTableById(table._id);
                await loadTables();
              } catch (err) {
                console.error("useTableManagement.removeTable:", err);
                Alert.alert("Error", "No se pudo eliminar la mesa.");
              }
            },
          },
        ]
      );
    },
    [loadTables]
  );

  return {
    tables,
    loading,
    error,

    isModalVisible,
    openManagement,
    closeManagement,
    loadTables,

    isFormVisible,
    editingTable,
    openCreateForm,
    openEditForm,
    cancelForm,

    formNumber,
    setFormNumber,
    formStatus,
    setFormStatus,
    submitting,
    submitForm,

    removeTable,
  };
}
