import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TableComponent from "./_components/table/table";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import OrderForm from "./_components/form/order-form";
import useSWR from 'swr';
import axios from 'axios';

// import dynamic from "next/dynamic";
// const TableComponent = dynamic(() => import("./_components/table/table"), {
//   ssr: false,
//   loading: () => <div>Loading Map...</div>, // Spinner atau placeholder
// });

// Define TypeScript interfaces for the API response
interface Order {
  id_order: string;
  id_user: string;
  bpid: string;
  status_order_header: string;
  plan_delivery: string;
  actual_delivery: string;
  created_at: string;
}

interface OrderDetail {
  id_order_detail: string;
  id_order: string;
  nomor_induk: string;
  brand: string;
  unit: string;
  type: string;
  voltase_spec: string;
  ah_spec: string;
  qty_order: number;
  request_delivery: string;
  increment_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  status_order_detail: string;
}

interface ApiResponse {
  orders: Order[];
  order_details: OrderDetail[];
}

// Create a fetcher function using Axios
const fetcher = (url: string) => axios.get<ApiResponse>(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
}).then(res => res.data);

const Order = () => {
  const { data, error } = useSWR<ApiResponse>('https://portal4.incoe.astra.co.id:4434/api/get_data_order', fetcher);

  if (!data && !error) return <div>Loading...</div>; // Show loading state
  if (error) return <div>Error: {error.message}</div>; // Show error state

  // Ensure data is defined before destructuring
  const orders = data?.orders || [];
  const order_details = data?.order_details || [];

  console.log(orders);
  console.log(order_details);

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">Orders Summary</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-white shadow-md">
          <CardHeader className="flex items-center">
            <ClipboardList className="mr-2 text-2xl" />
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardDescription>{orders.length}</CardDescription>
        </Card>

        <Card className="p-4 bg-white shadow-md">
          <CardHeader className="flex items-center">
            <Clock className="mr-2 text-2xl" />
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardDescription>{orders.filter((o: Order) => o.status_order_header === '0').length}</CardDescription>
        </Card>

        <Card className="p-4 bg-white shadow-md">
          <CardHeader className="flex items-center">
            <CheckCircle className="mr-2 text-2xl" />
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardDescription>{orders.filter((o: Order) => o.status_order_header === '1').length}</CardDescription>
        </Card>

        <Card className="p-4 bg-white shadow-md">
          <CardHeader className="flex items-center">
            <XCircle className="mr-2 text-2xl" />
            <CardTitle>Canceled</CardTitle>
          </CardHeader>
          <CardDescription>{orders.filter((o: Order) => o.status_order_header === '2').length}</CardDescription>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-xl font-bold">Customer Orders</h2>
        <div className="flex justify-between mb-4">
          
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="p-2 text-white bg-blue-500 rounded">
                Create a New Order
              </Button>
            </DrawerTrigger>
            <DrawerContent className="flex items-center justify-center sm:max-w-[900px] mx-auto">
              <div className="w-full">
                <DrawerHeader>
                  <DrawerTitle>Create New Order</DrawerTitle>
                  <DrawerDescription>
                    Fill in the details to create a new order.
                  </DrawerDescription>
                </DrawerHeader>
                <OrderForm />
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="p-4 overflow-x-auto bg-white rounded shadow-md">
          <TableComponent data={order_details} /> {/* Ensure this is the correct component */}
        </div>
      </div>
    </div>
  );
}

export default Order;
