// Order.tsx
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, CheckCircle, CloudUpload } from "lucide-react";
import useSWR from 'swr';
import axios from 'axios';
import BoxDetailModal from './_components/BoxDetailModal';
import Drawer from './_components/drawer';

interface WorkingOrder {
  TGL_PROD: string;
  PDNO: string;
  MITM: string;
  CWAR: string;
  QTY: number;
  LINE: number;
  STATUS: number;
}

interface Box {
  id_box: string;
  name_box: string;
  no_wo: string;
  status_box: string;
  kategori_box: string;
}

interface MatchingBox {
  id_box: string;
  no_wo: string;
  status_matching: string;
  pn: string;
  pn_sequence: number;
  pn_qty: number;
}

const fetcher = (url: string) => axios.get<WorkingOrder[]>(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
}).then(res => res.data);

const Order = () => {
  const { data, error } = useSWR('https://portal2.incoe.astra.co.id:3007/api_v2/lithium/getWoLithium', fetcher);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [boxSearchTerm, setBoxSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedOrder, setSelectedOrder] = React.useState<WorkingOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [boxes, setBoxes] = React.useState<Box[]>([]);
  const [matchingBoxes, setMatchingBoxes] = React.useState<MatchingBox[]>([]);
  const rowsPerPage = 10;

  const getSummaryCounts = (orders: WorkingOrder[] | undefined) => {
    if (!orders) return { total: 0, complete: 0, running: 0, pending: 0 };
    
    return {
      total: orders.length,
      complete: orders.filter(order => order.STATUS === 10).length,
      running: orders.filter(order => [5, 9].includes(order.STATUS)).length,
      pending: orders.filter(order => [1].includes(order.STATUS)).length
    };
  };

  const fetchBoxData = async () => {
    try {
      const response = await axios.get('https://portal4.incoe.astra.co.id:4434/api/get_data_master_box', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      const fetchedBoxes = response.data.boxes.map((box: any) => ({
        id_box: box.id_box,
        name_box: box.name_box,
        no_wo: box.no_wo,
        status_box: box.status_box,
        kategori_box: box.kategori_box,
      }));

      setBoxes(fetchedBoxes);
    } catch (err) {
      console.error('Error fetching box data:', err);
    }
  };

  const handleSelectOrder = async (order: WorkingOrder) => {
    setSelectedOrder(order);
    try {
      const matchingResponse = await axios.get(`https://portal4.incoe.astra.co.id:4434/api/get_data_matching_box`, {
        params: {
          no_wo: order.PDNO,
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      setMatchingBoxes(matchingResponse.data.matching_boxes);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching matching box data:', error);
    }
  };

  const handleSelectOrderDrawer = (order: WorkingOrder) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  React.useEffect(() => {
    fetchBoxData();
  }, []);

  if (!data && !error) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const filteredData = data ? data.filter((order: WorkingOrder) =>
    order.PDNO.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && indexOfLastRow < filteredData.length) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const filteredBoxData = boxes.filter(box =>
    box.name_box.toLowerCase().includes(boxSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const summaryCounts = getSummaryCounts(data);

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">Orders Summary</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-white shadow-md">
          <CardHeader className="flex flex-col items-center justify-center p-2 text-center">
            <ClipboardList className="mb-2 text-3xl text-blue-500" />
            <div className="flex flex-col items-center">
              <CardTitle>All WO</CardTitle>
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
              <CardTitle>WO Complete</CardTitle>
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
              <CardTitle>WO Running</CardTitle>
              <CardDescription className="mt-2 text-2xl font-bold text-yellow-600">
                {summaryCounts.running}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="p-4 bg-white shadow-md">
          <CardHeader className="flex flex-col items-center justify-center p-2 text-center">
            <CloudUpload className="mb-2 text-3xl text-red-500" />
            <div className="flex flex-col items-center">
              <CardTitle>WO Create</CardTitle>
              <CardDescription className="mt-2 text-2xl font-bold text-red-600">
                {summaryCounts.pending}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-xl font-bold">List Data</h2>
        <div className="flex justify-between">
          <div className="w-1/2 p-4 bg-white shadow-md">
            <h3 className="mb-2 font-bold">Table WO</h3>
            <input
              type="text"
              placeholder="Search by WO Number"
              className="w-full p-2 mb-4 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">WO Number</th>
                  <th className="px-4 py-2 border">Item</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((order, index) => (
                  <tr key={order.PDNO}>
                    <td className="px-4 py-2 text-center border">{indexOfFirstRow + index + 1}</td>
                    <td className="px-4 py-2 font-bold text-center text-blue-500 border cursor-pointer hover:underline hover:text-blue-600" 
                        onClick={() => handleSelectOrder(order)}>
                      {order.PDNO}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {new Date(order.TGL_PROD).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {order.MITM}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {order.STATUS === 1 ? 'Create' : 
                       order.STATUS === 5 ? 'Running' : 
                       order.STATUS === 9 ? 'Active' : 
                       order.STATUS === 10 ? 'Complete' : 
                       'Pending'}
                    </td>
                    <td className="flex items-center justify-center px-4 py-2 border">
                      <Button variant="outline" className="mr-2" onClick={() => handleSelectOrderDrawer(order)}>
                        Select
                      </Button>
                      <Button variant="ghost" className="mr-2" onClick={() => handleSelectOrder(order)}>
                        Detail
                      </Button>
                      <Button variant="destructive" className="mr-2">
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <Button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
                Previous
              </Button>
              <div className="flex items-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`mx-1 ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button onClick={() => handlePageChange('next')} disabled={indexOfLastRow >= filteredData.length}>
                Next
              </Button>
            </div>
          </div>

          <div className="w-1/2 p-4 bg-white shadow-md">
            <h3 className="mb-2 font-bold">Table Master Box</h3>
            <input
              type="text"
              placeholder="Search by Box ID"
              className="w-full p-2 mb-4 border rounded"
              value={boxSearchTerm}
              onChange={(e) => setBoxSearchTerm(e.target.value)}
            />
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">No WO</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoxData.map((box, index) => (
                  <tr key={box.id_box}>
                    <td className="px-4 py-2 text-center border">{index + 1}</td>
                    <td className="px-4 py-2 text-center border">{box.name_box}</td>
                    <td className="px-4 py-2 text-center border">{box.no_wo}</td>
                    <td className="px-4 py-2 text-center border">{box.status_box}</td>
                    <td className="flex items-center justify-center px-4 py-2 border">
                      <Button variant="outline" className="mr-2">
                        Select
                      </Button>
                      <Button variant="destructive" className="mr-2">
                        Reset
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BoxDetailModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        boxDetails={matchingBoxes.map(box => ({
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          id_box: box.id_box,
          no_wo: box.no_wo,
          status_matching: box.status_matching,
          pn: box.pn,
          pn_sequence: box.pn_sequence
        }))}
      />

      <Drawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        selectedOrder={selectedOrder}
      />
    </div>
  );
}

export default Order;