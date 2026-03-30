import React from 'react';

// This simulates the data you'll eventually get from your MERN backend
const products = [
  { id: 1, name: "Premium Long Grain Rice", price: "$25.00", category: "Grains" },
  { id: 2, name: "Brown Basmati Rice", price: "$30.00", category: "Grains" },
  { id: 3, name: "Organic Jasmine Rice", price: "$28.00", category: "Specialty" },
];

export default function ProductsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
        <p className="text-gray-600">High-quality grains for your business.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
          >
            <div className="w-full h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
              <span className="text-gray-400">Product Image</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
              {product.category}
            </span>
            <h2 className="text-xl font-bold mt-1">{product.name}</h2>
            <p className="text-gray-700 mt-2 font-medium">{product.price}</p>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}