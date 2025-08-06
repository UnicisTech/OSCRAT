import React, { useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { useTranslation } from 'next-i18next';

// TODO: Get from actual form results once established
const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    productName: 'N5 5nm - 9 7950x',
    version: 'Version 1.2',
    category: 'Important - Class I',
    role: 'Manufacturer',
  },
  {
    id: 'prod-2',
    productName: 'N5 4nm - MTD 9200',
    version: 'Version 12.3.b',
    category: 'Important - Class II',
    role: 'Manufacturer',
  },
  {
    id: 'prod-3',
    productName: 'N5 5nm - 9 7950x',
    version: 'Version 7.9',
    category: 'Important - Class I',
    role: 'Manufacturer',
  },
];

export default function App() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const { t, ready } = useTranslation('common');

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    alert(`"Add Product" clicked for: ${product?.productName}`);
  };

  const tableHeaders = ['Product', 'Version', 'Category', 'Role', ''];

  if (!ready) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="p-4">
          <h1 className="text-lg font-semibold text-gray-800">
            {t('oscrat.ui.completed-applicability-check')}
          </h1>
          <p className="mt-1 text-[13px] text-gray-500">
            {t('oscrat.ui.use-the-information')}
          </p>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto px-4">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-800">
              <tr>
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b bg-white last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.productName}
                  </td>
                  <td className="px-6 py-4">{product.version}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">{product.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAddProduct(product.id)}
                      className="flex items-center text-sm font-medium text-gray-500"
                    >
                      <IoMdAdd className="mr-1" size={16} />
                      {t('add-product')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
