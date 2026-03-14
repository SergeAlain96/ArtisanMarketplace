/* eslint-disable react/prop-types */
'use client';

import { useEffect, useState } from 'react';

const emptyValues = {
  name: '',
  description: '',
  price: ''
};

function resolvePrice(value) {
  if (value === null || value === undefined) {
    return emptyValues.price;
  }

  return String(value);
}

export default function ProductForm(props) {
  const {
    onSubmit,
    loading,
    initialValues = null,
    submitLabel = 'Create product',
    title = 'Add product',
    onCancel
  } = props;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState('');
  const hasCancelAction = typeof onCancel === 'function';

  useEffect(() => {
    setName(initialValues?.name || emptyValues.name);
    setDescription(initialValues?.description || emptyValues.description);
    setPrice(resolvePrice(initialValues?.price));
    setFormError('');
  }, [initialValues]);

  function validateForm() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);

    if (trimmedName.length < 2) return 'Name must contain at least 2 characters.';
    if (trimmedDescription.length < 5) return 'Description must contain at least 5 characters.';
    if (Number.isNaN(numericPrice) || numericPrice < 0) return 'Price must be a positive number.';
    return '';
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    setFormError(validationError);
    if (validationError) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      images: []
    });
  }

  function handleCancel() {
    setName(initialValues?.name || emptyValues.name);
    setDescription(initialValues?.description || emptyValues.description);
    setPrice(resolvePrice(initialValues?.price));
    setFormError('');

    if (hasCancelAction) {
      onCancel();
    }
  }

  return (
    <form className="card grid gap-3" onSubmit={handleSubmit}>
      <h3 className="text-base font-semibold">{title}</h3>
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        placeholder="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <textarea
        className="rounded-md border border-slate-300 px-3 py-2"
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        required
      />
      <input
        type="number"
        min="0"
        step="0.01"
        className="rounded-md border border-slate-300 px-3 py-2"
        placeholder="Price"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        required
      />
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand-500 px-3 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : submitLabel}
        </button>
        {hasCancelAction ? (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border px-3 py-2 hover:bg-slate-100"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
