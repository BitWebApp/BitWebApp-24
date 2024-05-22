import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAcademicRecords = () => {
    const [academicRecords, setAcademicRecords] = useState([]);
    const [sortConfigs, setSortConfigs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);    

    useEffect(() => {
        const fetchAcademicRecords = async () => {
            try {
                const response = await axios.get('/api/v1/academics/adminRecords');
                if (response.data && response.data.data) {
                    setAcademicRecords(response.data.data);
                } else {
                    setAcademicRecords([]);
                }
            } catch (error) {
                console.error('Error fetching academic records:', error);
            }
        };

        fetchAcademicRecords();
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

    const sortedAcademicRecords = [...academicRecords].sort((a, b) => {
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

    const filteredAcademicRecords = sortedAcademicRecords.filter((record) => {
        const query = searchQuery.toLowerCase();
        return (
            record.rollNumber.toLowerCase().includes(query) ||
            record.fullName.toLowerCase().includes(query) ||
            record.branch.toLowerCase().includes(query) ||
            record.section.toLowerCase().includes(query) ||
            record.semester.toString().toLowerCase().includes(query) ||
            record.gpa.toString().toLowerCase().includes(query)
        );
    });

    const getSortDirection = (key) => {
        const config = sortConfigs.find(config => config.key === key);
        return config ? config.direction : 'default';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Admin Academic Records</h1>
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4 px-4 py-2 border rounded"
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roll No
                                <div>
                                    <select value={getSortDirection('rollNumber')} onChange={(e) => handleSortOptionChange('rollNumber', e)}>
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Full Name
                                <div>
                                    <select value={getSortDirection('fullName')} onChange={(e) => handleSortOptionChange('fullName', e)}>
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Branch
                                <div>
                                    <select value={getSortDirection('branch')} onChange={(e) => handleSortOptionChange('branch', e)}>
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Section
                                <div>
                                    <select value={getSortDirection('section')} onChange={(e) => handleSortOptionChange('section', e)}>
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Semester
                                <div>
                                    <select value={getSortDirection('semester')} onChange={(e) => handleSortOptionChange('semester', e)}>
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                GPA
                                <div>
                                    <select value={getSortDirection('gpa')} onChange={(e) => handleSortOptionChange('gpa', e)}>
                                        <option value="default">Default</option>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAcademicRecords.map((record) => (
                            <tr key={record._id} className={selectedRows.includes(record._id) ? 'bg-gray-100' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">{record.rollNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.branch}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.section}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.semester}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.gpa}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAcademicRecords;
