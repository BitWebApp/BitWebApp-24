import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminReviewRecords = () => {
    const [reviews, setReviews] = useState([]);
    const [sortConfigs, setSortConfigs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('/api/v1/reviews');
                if (response.data && response.data.data) {
                    setReviews(response.data.data);
                } else {
                    setReviews([]);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, []);

    const handleSortOptionChange = (key, e) => {
        const sortType = e.target.value;
        handleSort(key, sortType);
    };

    const handleSort = (key, sortType) => {
        let newSortConfigs = [];

        if (sortType === 'default') {
            newSortConfigs = sortConfigs.filter(config => config.key !== key);
        } else {
            const existingSortIndex = sortConfigs.findIndex(config => config.key === key);
            if (existingSortIndex !== -1) {
                newSortConfigs = sortConfigs.map((config, index) => {
                    if (index === existingSortIndex) {
                        return { ...config, direction: sortType };
                    }
                    return config;
                });
            } else {
                newSortConfigs = [...sortConfigs, { key, direction: sortType }];
            }
        }

        setSortConfigs(newSortConfigs);
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        for (const config of sortConfigs) {
            if (a[config.key] < b[config.key]) {
                return config.direction === 'ascending' ? -1 : 1;
            }
            if (a[config.key] > b[config.key]) {
                return config.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    });

    const filteredReviews = sortedReviews.filter((review) => {
        const query = searchQuery.toLowerCase();
        return (
            review.name.toLowerCase().includes(query) ||
            review.rollNumber.toLowerCase().includes(query) ||
            review.content.toLowerCase().includes(query)
        );
    }).filter((review) => {
        return Object.keys(filters).every((key) => {
            return filters[key] === 'all' || review[key] === filters[key];
        });
    });

    const getSortDirection = (key) => {
        const config = sortConfigs.find(config => config.key === key);
        return config ? config.direction : 'default';
    };

    const handleFilterChange = (key, value) => {
        setFilters({
            ...filters,
            [key]: value,
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Admin Review Records</h1>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border rounded w-1/2"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReviews.map((review, index) => (
                    <div key={index} className="border rounded shadow-md bg-white overflow-hidden">
                        <div className="p-4 bg-gray-200 border-b">
                            <h2 className="text-lg font-medium">{review.name}</h2>
                            <p className="text-gray-500">{review.rollNumber}</p>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700">{review.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminReviewRecords;
