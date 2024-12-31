import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle, Clock, CloudUpload } from "lucide-react";
import axios from 'axios';
import Scan from "../_components/scan";

interface MatchingBox {
    id_box: string;
    no_wo: string;
    status_matching: string;
    pn: string;
    pn_qty: number;
    pn_wo: string;
    user_id: string;
    status_item: string;
    created_at: string;
}

const Order = () => {
    // Get first and last day of current month
    const getDefaultDates = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        };
    };

    const defaultDates = getDefaultDates();
    const [startDate, setStartDate] = React.useState<string>(defaultDates.start);
    const [endDate, setEndDate] = React.useState<string>(defaultDates.end);
    const [matchingBoxes, setMatchingBoxes] = React.useState<MatchingBox[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>("");
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = React.useState<number>(10); // Default items per page
    const [searchTerm, setSearchTerm] = React.useState<string>(""); // State for search term

    // Fetch matching boxes based on date range
    const fetchMatchingBoxes = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await axios.get('https://portal4.incoe.astra.co.id:4434/api/get_data_matching_box_transfers', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && Array.isArray(response.data.matching_boxes)) {
                setMatchingBoxes(response.data.matching_boxes);
            } else {
                setError("Invalid data format received from server");
            }
        } catch (err) {
            setError("Failed to fetch data. Please try again.");
            console.error('Error fetching matching boxes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch on component mount
    React.useEffect(() => {
        fetchMatchingBoxes();
    }, []); // Empty dependency array for initial load only

    // Pagination logic
    const indexOfLastBox = currentPage * itemsPerPage;
    const indexOfFirstBox = indexOfLastBox - itemsPerPage;
    const currentBoxes = matchingBoxes.slice(indexOfFirstBox, indexOfLastBox);

    const totalPages = Math.ceil(matchingBoxes.length / itemsPerPage);

    const handlePageChange = (direction: 'next' | 'prev') => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    // Filter matching boxes based on search term
    const filteredBoxes = matchingBoxes.filter(box => {
        return (
            box.id_box.toLowerCase().includes(searchTerm.toLowerCase()) ||
            box.no_wo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            box.pn.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const summaryCounts = {
        total: filteredBoxes.length,
        complete: filteredBoxes.filter(box => box.status_matching === "2").length,
        matching: filteredBoxes.filter(box => box.status_matching === "1").length,
        pending: filteredBoxes.filter(box => box.status_matching === "0").length,
    };

    // Function to get status label
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "2": return "Complete";
            case "1": return "Matching";
            case "0": return "Pending";
            default: return "Unknown";
        }
    };

    // Function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "10": return "text-green-600";
            case "5": return "text-yellow-600";
            case "1": return "text-red-600";
            default: return "text-gray-600";
        }
    };

    const stationValue = "3"; // Define the station value

    return (
        <div className="flex flex-col gap-6 p-6 bg-gray-100">
            <h1 className="mb-4 text-2xl font-bold">Transaction Summary</h1>

            <div className="flex flex-col gap-4 mb-4 md:flex-row">
                <div className="flex gap-2">
                    <input
                        type="date"
                        className="p-2 border rounded"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        className="p-2 border rounded"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <Button
                    onClick={fetchMatchingBoxes}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Filter"}
                </Button>
            </div>

            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4 bg-white shadow-md">
                    <CardHeader className="flex flex-col items-center justify-center p-2 text-center">
                        <ClipboardList className="mb-2 text-3xl text-blue-500" />
                        <div className="flex flex-col items-center">
                            <CardTitle>All Transaction</CardTitle>
                            <CardDescription className="mt-2 text-2xl font-bold text-blue-600">
                                {summaryCounts.total}
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="p-4 bg-white shadow-md">
                    <CardHeader className="flex flex-col items-center justify-center p-2 text-center">
                        <CheckCircle className="mb-2 text-3xl text-green-500" />
                        <div className="flex flex-col items-center">
                            <CardTitle>Transaction Complete</CardTitle>
                            <CardDescription className="mt-2 text-2xl font-bold text-green-600">
                                {summaryCounts.complete}
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="p-4 bg-white shadow-md">
                    <CardHeader className="flex flex-col items-center justify-center p-2 text-center">
                        <Clock className="mb-2 text-3xl text-yellow-500" />
                        <div className="flex flex-col items-center">
                            <CardTitle>Transaction Matching</CardTitle>
                            <CardDescription className="mt-2 text-2xl font-bold text-yellow-600">
                                {summaryCounts.matching}
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="p-4 bg-white shadow-md">
                    <CardHeader className="flex flex-col items-center justify-center p-2 text-center">
                        <CloudUpload className="mb-2 text-3xl text-red-500" />
                        <div className="flex flex-col items-center">
                            <CardTitle>Transaction Pending</CardTitle>
                            <CardDescription className="mt-2 text-2xl font-bold text-red-600">
                                {summaryCounts.pending}
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="mt-6">
                <Scan station={stationValue}/>
            </div>

            <div className="mt-6">
                <h2 className="mb-2 text-xl font-bold">List Data</h2>
                <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                        <label className="mr-2">Show:</label>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="p-2 border rounded"
                        >
                            <option value={10}>10</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={1000}>1000</option>
                            <option value={-1}>All</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <Button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
                            Previous
                        </Button>
                        <span className="mx-2">Page {currentPage} of {totalPages}</span>
                        <Button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>
                            Next
                        </Button>
                    </div>
                </div>

                <Card className="p-4 bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <div className="flex mb-4">
                            <input
                                type="text"
                                placeholder="Search by Box ID, No WO, or PN"
                                className="w-full p-2 border rounded"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Box ID</th>
                                    <th className="px-4 py-2 border">No WO</th>
                                    <th className="px-4 py-2 border">Status Matching</th>
                                    <th className="px-4 py-2 border">PN</th>
                                    <th className="px-4 py-2 border">Quantity</th>
                                    <th className="px-4 py-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBoxes.map((box, index) => (
                                    <tr key={`${box.id_box}-${box.pn}`}>
                                        <td className="px-4 py-2 text-center border">{index + 1}</td>
                                        <td className="px-4 py-2 text-center border">{box.id_box}</td>
                                        <td className="px-4 py-2 text-center border">{box.no_wo}</td>
                                        <td className={`px-4 py-2 text-center border ${getStatusColor(box.status_matching)}`}>
                                            {getStatusLabel(box.status_matching)}
                                        </td>
                                        <td className="px-4 py-2 text-center border">{box.pn}</td>
                                        <td className="px-4 py-2 text-center border">{box.pn_qty}</td>
                                        <td className="flex items-center justify-center px-4 py-2 border">
                                            <Button variant="outline" className="mr-2">
                                                Select
                                            </Button>
                                            <Button variant="destructive" className="mr-2">
                                                Cancel
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Order;
