import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type BreadcrumbItem } from '@/types';
import axios from "@/lib/axios";
import AppLayout from "@/layouts/app-layout";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Companies',
        href: '/companies',
    }
];

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async (page = 1) => {
        try {
            const response = await axios.get(`/api/companies?page=${page}&search=${search}`);
            setCompanies(response.data.data || []);
            setPagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                per_page: response.data.per_page || 20,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        // Debounce search
        setTimeout(() => loadCompanies(1), 300);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <AppHeader />
                <div className="container mx-auto p-6">
                    <div className="text-center">Loading companies...</div>
                </div>
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-background">
                {/* <AppHeader /> */}
                <div className="container mx-auto space-y-6 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Companies</h1>
                        <div className="flex items-center space-x-4">
                            <Input
                                placeholder="Search companies..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-64"
                            />
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Company Data ({pagination.total} total)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {companies.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {Object.keys(companies[0] || {}).map((column) => (
                                                    <TableHead key={column} className="text-gray-600">
                                                        {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {companies.map((company, index) => (
                                                <TableRow key={index}>
                                                    {Object.values(company).map((value: any, colIndex) => (
                                                        <TableCell key={colIndex} className="text-gray-700">
                                                            {value ? String(value) : '-'}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No companies found. Upload and process some data first.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {pagination.last_page > 1 && (
                        <div className="flex justify-center space-x-2">
                            <button
                                onClick={() => loadCompanies(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-2">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                onClick={() => loadCompanies(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>

    );
}
