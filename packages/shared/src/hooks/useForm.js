import { useState } from 'react';

// Custom hook para manejar formularios (igual que en la web)
export const useForm = (initialState = {}) => {
  const [form, setForm] = useState(initialState);

  const onChange = (value, field) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  return {
    ...form,
    form,
    onChange,
  };
};