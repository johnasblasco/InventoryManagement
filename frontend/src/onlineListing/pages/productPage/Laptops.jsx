import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import ProductHeader from '../../components/ProductHeader';

const Laptops = () => {
    const [query, setQuery] = useState('');
    const productsPerPage = 10;
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Acer Predator Helios 16 PH16-72-96H6 Gaming Laptop (Abyssal Black)',
            price: 1500,
            image: 'https://cdn.pixabay.com/photo/2016/03/27/07/12/apple-1282241_1280.jpg',
            category: 'Gaming Laptops',
            subcategory: 'Laptops',
            processorType: 'Intel i5',
            brand: 'Acer',
            discount: 10,
            sales: 300 // Added sales for top selling filter
        },
        {
            id: 2,
            name: 'Nigga byte Black Nigger Laptop (Black)',
            price: 6900,
            image: 'https://cdn.pixabay.com/photo/2016/03/27/07/12/apple-1282241_1280.jpg',
            category: 'Laptops',
            subcategory: 'Laptops',
            processorType: 'Intel i7',
            brand: 'Digabyte',
            discount: 20,
            sales: 150 // Added sales for top selling filter
        },
        // Add more products here if needed
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        priceRange: [0, 10000],
        category: [],
        subcategory: [], // Added subcategory filter
        processorType: [],
        brand: [],
        discount: [],
    });

    const handleQueryChange = (newQuery) => {
        setQuery(newQuery);
    };

    const handleFilterChange = (filterType, filterValue) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterType]: prevFilters[filterType].includes(filterValue)
                ? prevFilters[filterType].filter((v) => v !== filterValue)
                : [...prevFilters[filterType], filterValue],
        }));
    };

    const filteredProducts = products.filter((product) => {
        const isMatched = product.name.toLowerCase().includes(query.toLowerCase());
        const isPriceInRange = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
        const isCategoryMatched = filters.category.length === 0 || filters.category.includes(product.category);
        const isSubcategoryMatched = filters.subcategory.length === 0 || filters.subcategory.includes(product.subcategory); // Check subcategory
        const isProcessorTypeMatched = filters.processorType.length === 0 || filters.processorType.includes(product.processorType);
        const isBrandMatched = filters.brand.length === 0 || filters.brand.includes(product.brand);
        const isDiscountMatched = filters.discount.length === 0 || filters.discount.includes(product.discount);
        
        return (
            isMatched &&
            isPriceInRange &&
            isCategoryMatched &&
            isSubcategoryMatched && // Include subcategory check
            isProcessorTypeMatched &&
            isBrandMatched &&
            isDiscountMatched
        );
    });

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayedProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <>
            <div className='w-full text-black flex flex-col bg-white'>
                <Navbar query={query} onQueryChange={handleQueryChange} cartItemCount={1} />

                <div className="container w-full mt-40 mx-auto md:p-4">
                    <p className='p-4 mb-8'>Home &gt; Laptops</p>

                    <div className='flex w-full'>
                        {/* left side Filter HERE */}
                        <div className="max-md:hidden min-w-[20%] max-w-[20%] bg-white border border-gray-200 p-4 rounded-lg shadow-lg space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Filters</h2>

                            {/* Price Range */}
                            <div className="border-b border-gray-300 pb-4 mb-4">
                                <h3 className="text-lg font-medium mb-2">Price Range</h3>
                                <div className="flex justify-between items-center mb-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="10000"
                                        value={filters.priceRange[0]}
                                        onChange={(e) =>
                                            setFilters((prevFilters) => ({
                                                ...prevFilters,
                                                priceRange: [Number(e.target.value), filters.priceRange[1]],
                                            }))
                                        }
                                        className="w-1/3 border border-gray-300 p-1 text-center text-sm"
                                        placeholder="Min"
                                    />
                                    <span className="mx-2 text-sm">-</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10000"
                                        value={filters.priceRange[1]}
                                        onChange={(e) =>
                                            setFilters((prevFilters) => ({
                                                ...prevFilters,
                                                priceRange: [filters.priceRange[0], Number(e.target.value)],
                                            }))
                                        }
                                        className="w-1/3 border border-gray-300 p-1 text-center text-sm"
                                        placeholder="Max"
                                    />
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={10000}
                                    value={filters.priceRange[0]}
                                    onChange={(e) =>
                                        setFilters((prevFilters) => ({
                                            ...prevFilters,
                                            priceRange: [Number(e.target.value), filters.priceRange[1]],
                                        }))
                                    }
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm mt-1">
                                    <span>₱{filters.priceRange[0]}</span>
                                    <span>₱{filters.priceRange[1]}</span>
                                </div>
                            </div>

                            <div>
                            <h3 className="text-lg font-medium mb-2">Top Selling</h3>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.isTopSelling}
                                        onChange={() => setFilters((prevFilters) => ({
                                        ...prevFilters,
                                        isTopSelling: !prevFilters.isTopSelling,
                                        }))}
                                        className="form-checkbox"/>
                                        <span className="text-sm text-gray-700">Show Top Selling</span>
                                </div>
                        </div>

                            {/* Subcategory Filter */}
                            <div className="border-b border-gray-300 pb-4 mb-4">
                                <h3 className="text-lg font-medium mb-2">Subcategory</h3>
                                <label className="block">
                                    <input
                                        type="checkbox"
                                        onChange={() => handleFilterChange('subcategory', 'Laptops')}
                                    />
                                    Laptops
                                </label>
                                <label className="block">
                                    <input
                                        type="checkbox"
                                        onChange={() => handleFilterChange('subcategory', 'Chromebooks')}
                                    />
                                    Chromebooks
                                </label>
                            </div>
                        </div>

                        {/* right side Products HERE */}
                        <div className='md:ml-6 w-full'>
                            <ProductHeader header={"Laptops"} />
                            <div className="m-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {displayedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
};

export default Laptops;
