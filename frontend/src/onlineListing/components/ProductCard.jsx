import React from 'react';
import { IoEyeOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import '../onlineListing.css';
import { useProductContext } from '../page'; // Adjust path if necessary

const ProductCard = ({ product }) => {
      const navigate = useNavigate();
      const { addToCart } = useProductContext();

      const handleViewProduct = () => {
            navigate(`/iRIG/products/view/${product._id}`, { state: { product } });
      };

      return (
            <div className="rounded-lg bg-white border border-gray-200 p-2 text-center hover:shadow-lg transition duration-200 w-48 h-64 flex flex-col">
                  <div className='flex items-center justify-center'>
                        <img src={product.image} alt={product.name} className="w-24 h-24 object-cover" />
                  </div>
                  <div className='flex flex-col items-center justify-center flex-grow'>
                        <p className="text-orange-500 text-sm font-bold mb-1 text-left w-full">
                              ₱{product.price ? product.price.toLocaleString() : "N/A"}
                        </p>
                        <p className="text-xs font-semibold mb-1 text-left w-full">
                              {product.name || "No Name Available"}
                        </p>
                  </div>
                  <div className="flex gap-1 items-center justify-center">
                        <button
                              className="bg-orange-600 py-1 px-4 text-white rounded hover:bg-orange-700 transition duration-200 text-sm"
                              onClick={() => addToCart(product)}
                        >
                              Add to Cart
                        </button>
                        <button
                              onClick={handleViewProduct}
                              className="bg-orange-600 text-white py-1 px-4 text-lg rounded hover:bg-orange-700 transition duration-200 flex items-center justify-center"
                        >
                              <IoEyeOutline />
                        </button>
                  </div>
            </div>
      );
};

export default ProductCard;
