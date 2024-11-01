import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import ProductHeader from '../../components/ProductHeader';

const Peripherals = () => {
    const [query, setQuery] = useState('');
    const productsPerPage = 10;
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Logitech Wireless Mouse',
            price: 20,
            image: 'https://cdn.pixabay.com/photo/2014/04/03/10/33/keyboard-310084_1280.png',
            category: 'Mice',
            brand: 'Logitech',
            discount: 15,
            isTopSelling: true // Example property for top-selling
        },
        {
            id: 2,
            name: 'Razer Mechanical Keyboard',
            price: 100,
            image: 'https://cdn.pixabay.com/photo/2014/04/02/10/27/mouse-304207_1280.png',
            category: 'Keyboards',
            brand: 'Razer',
            discount: 10,
            isTopSelling: false // Example property for top-selling
        },
        // Add more products here if needed
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        priceRange: [0, 200],
        category: [],
        brand: [],
        discount: [],
        isTopSelling: false, // New filter for top-selling products
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

    const handlePriceChange = (index, value) => {
        setFilters((prevFilters) => {
            const newPriceRange = [...prevFilters.priceRange];
            newPriceRange[index] = Number(value);
            return { ...prevFilters, priceRange: newPriceRange };
        });
    };

    const filteredProducts = products.filter((product) => {
        const isMatched = product.name.toLowerCase().includes(query.toLowerCase());
        const isPriceInRange = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
        const isCategoryMatched = filters.category.length === 0 || filters.category.includes(product.category);
        const isBrandMatched = filters.brand.length === 0 || filters.brand.includes(product.brand);
        const isDiscountMatched = filters.discount.length === 0 || filters.discount.includes(product.discount);
        const isTopSellingMatched = !filters.isTopSelling || product.isTopSelling;

        return (
            isMatched &&
            isPriceInRange &&
            isCategoryMatched &&
            isBrandMatched &&
            isDiscountMatched &&
            isTopSellingMatched
        );
    });

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayedProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <div className='w-full text-black flex flex-col bg-white'>
            <Navbar query={query} onQueryChange={handleQueryChange} cartItemCount={1} />
            <div className="container w-full mt-40 mx-auto md:p-4">
                <p className='p-4 mb-8'>Home &gt; Peripherals</p>
                <div className='flex w-full'>
                    <div className="max-md:hidden min-w-[20%] max-w-[20%] bg-white border border-gray-200 p-4 rounded-lg shadow-lg space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Filters</h2>

                        {/* Price Range Filter */}
                        <div className="border-b border-gray-300 pb-4 mb-4">
                            <h3 className="text-lg font-medium mb-2">Price Range</h3>
                            <div className="flex justify-between items-center mb-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="10000"
                                    value={filters.priceRange[0]}
                                    onChange={(e) => handlePriceChange(0, e.target.value)}
                                    className="w-1/3 border border-gray-300 p-1 text-center text-sm"
                                    placeholder="Min"
                                />
                                <span className="mx-2 text-sm">-</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="10000"
                                    value={filters.priceRange[1]}
                                    onChange={(e) => handlePriceChange(1, e.target.value)}
                                    className="w-1/3 border border-gray-300 p-1 text-center text-sm"
                                    placeholder="Max"
                                />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={10000}
                                value={filters.priceRange[0]}
                                onChange={(e) => handlePriceChange(0, e.target.value)}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm mt-1">
                                <span>₱{filters.priceRange[0]}</span>
                                <span>₱{filters.priceRange[1]}</span>
                            </div>
                        </div>

                        {/* Top Selling Checkbox */}
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
                                        className="form-checkbox"
                                    />
                                    <span className="text-sm text-gray-700">Show Top Selling</span>
                                </div>
                            </div>

                        {/* Category Filter */}
                        <div>
                            <h3 className="font-semibold">Categories</h3>
                            {["CCTV Camera", "Headset", "Keyboard", "Keyboard and Mouse Combo", "Monitor", "Mouse", "Network Devices", "Printer & Scanner", "Projector", "Audio Recorder", "Speaker", "UPS & AVR", "Web & Digital Camera"].map((category) => (
                                <div key={category}>
                                    <input
                                        type="checkbox"
                                        onChange={() => handleFilterChange('category', category)}
                                        checked={filters.category.includes(category)}
                                    />
                                    <label className="ml-2">{category}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='md:ml-6 w-full'>
                        <ProductHeader header={"Peripherals"} />
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
    );
};

export default Peripherals;
