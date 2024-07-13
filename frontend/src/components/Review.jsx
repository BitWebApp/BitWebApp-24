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
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                                <div>
                                    <select
                                        value={getSortDirection('name')}
                                        onChange={(e) => handleSortOptionChange('name', e)}
                                    >
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                    <select
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                        className="mt-2"
                                    >
                                        <option value="all">All</option>
                                        {reviews.map(review => (
                                            <option key={review.name} value={review.name}>
                                                {review.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roll Number
                                <div>
                                    <select
                                        value={getSortDirection('rollNumber')}
                                        onChange={(e) => handleSortOptionChange('rollNumber', e)}
                                    >
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                    <select
                                        onChange={(e) => handleFilterChange('rollNumber', e.target.value)}
                                        className="mt-2"
                                    >
                                        <option value="all">All</option>
                                        {reviews.map(review => (
                                            <option key={review.rollNumber} value={review.rollNumber}>
                                                {review.rollNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Content
                                <div>
                                    <select
                                        value={getSortDirection('content')}
                                        onChange={(e) => handleSortOptionChange('content', e)}
                                    >
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                    <select
                                        onChange={(e) => handleFilterChange('content', e.target.value)}
                                        className="mt-2"
                                    >
                                        <option value="all">All</option>
                                        {reviews.map(review => (
                                            <option key={review.content} value={review.content}>
                                                {review.content}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReviews.map((review, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {review.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {review.rollNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {review.content}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReviewRecords;
