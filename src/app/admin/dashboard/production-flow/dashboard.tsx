import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSWR from 'swr';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductionData {
  created_at: string;
  no_wo: string;
  pn: string;
  pn_desc: string;
  component: number;
  station_1: number;
  station_2: number;
  station_3: number;
  warehouse: number;
  delivery: number;
  component_updated: string;
  station_1_updated: string | null;
  station_2_updated: string | null;
  station_3_updated: string | null;
  warehouse_updated: string | null;
  delivery_updated: string | null;
  status_wo: string;
}

interface WorkOrderData {
  TGL_PROD: string;
  PDNO: string;
  MITM: string;
  CWAR: string;
  QTY: number;
  LINE: number;
  STATUS: number;
}

interface ProductionStage {
  id: string;
  title: string;
  value: number;
  updated: string | null | undefined;
  position: {
    x: string;
    y: string;
  };
}

const fetcher = (url: string) => axios.get(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  }
}).then(res => res.data);

const Dashboard = () => {
  const [woNumber, setWoNumber] = useState("PKAL00111");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const { data: productionData, error: productionError, mutate } = useSWR<ProductionData[]>(
    woNumber ? `https://portal4.incoe.astra.co.id:4434/api/get_data_tracer_production_detail?no_wo=${woNumber}` : null,
    fetcher
  );

  const { data: woData, error: woError } = useSWR<WorkOrderData[]>(
    'https://portal2.incoe.astra.co.id:3007/api_v2/lithium/getWoLithium',
    fetcher
  );

  const productionStages: ProductionStage[] = [
    {
      id: 'component',
      title: 'Collection & Sorting',
      value: productionData?.[0]?.component || 0,
      updated: productionData?.[0]?.component_updated,
      position: { x: '25%', y: '45%' }
    },
    {
      id: 'station_1',
      title: 'Station 1',
      value: productionData?.[0]?.station_1 || 0,
      updated: productionData?.[0]?.station_1_updated,
      position: { x: '40%', y: '25%' }
    },
    {
      id: 'station_2',
      title: 'Station 2',
      value: productionData?.[0]?.station_2 || 0,
      updated: productionData?.[0]?.station_2_updated,
      position: { x: '35%', y: '80%' }
    },
    {
      id: 'station_3',
      title: 'Station 3',
      value: productionData?.[0]?.station_3 || 0,
      updated: productionData?.[0]?.station_3_updated,
      position: { x: '70%', y: '25%' }
    },
    {
      id: 'warehouse',
      title: 'Final Manufacturing',
      value: productionData?.[0]?.warehouse || 0,
      updated: productionData?.[0]?.warehouse_updated,
      position: { x: '75%', y: '55%' }
    }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    mutate().finally(() => setIsLoading(false));
  };

  // Filter and paginate table data
  const filteredData = woData?.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (productionError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <CardContent>
            <p className="text-red-500">Error loading data. Please check your authorization token.</p>
            <Button onClick={handleRefresh} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen gap-6 p-6 bg-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Production Flow Dashboard</h1>
        <div className="flex gap-4">
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-white rounded-lg shadow-lg h-96">
        <img
          src="/assets/ANIMAZIONE_OLDRATI.gif"
          alt="Production Flow"
          className="object-contain w-full h-full"
        />

        {productionStages.map((stage) => (
          <div
            key={stage.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: stage.position.x,
              top: stage.position.y
            }}
          >
            <Card className="w-32 transition-transform cursor-pointer bg-white/90 backdrop-blur-sm hover:scale-105">
              <CardContent className="p-2">
                <h3 className="mb-1 text-xs font-semibold">{stage.title}</h3>
                <div className="flex items-center gap-1">
                  {stage.value === 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="text-sm font-bold">{stage.value}</div>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-gray-500">
                  {stage.updated ? new Date(stage.updated).toLocaleString() : 'No data'}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold">Work Order Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">WO Number:</span> {productionData?.[0]?.no_wo}</p>
              <p><span className="font-medium">Part Number:</span> {productionData?.[0]?.pn}</p>
              <p><span className="font-medium">Status:</span> {productionData?.[0]?.status_wo === "0" ? "In Progress" : "Completed"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Work Order List</h3>
              <Input
                type="search"
                placeholder="Search..."
                className="w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>WO Number</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Line</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item: WorkOrderData, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(item.TGL_PROD).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => setWoNumber(item.PDNO)}
                          className={`hover:text-blue-600 hover:underline ${woNumber === item.PDNO ? 'font-bold text-blue-600' : ''
                            }`}
                        >
                          {item.PDNO}
                        </button>
                      </TableCell>
                      <TableCell>{item.MITM}</TableCell>
                      <TableCell>{item.CWAR}</TableCell>
                      <TableCell>{item.QTY}</TableCell>
                      <TableCell>{item.LINE}</TableCell>
                      <TableCell>{item.STATUS}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;