import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from 'zod';
import React, { useState } from 'react';

export const orderSchema = z.object({
  id_order_detail: z.string(),
  id_order: z.string(),
  nomor_induk: z.string(),
  brand: z.string(),
  unit: z.string(),
  type: z.string(),
  voltase_spec: z.string(),
  ah_spec: z.string(),
  qty_order: z.number(),
  request_delivery: z.string(),
  increment_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string(),
  status_order_detail: z.string(),
});

interface OrderDetail {
  id_order_detail: string; // Ensure this is unique
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

interface TableProps {
  data: OrderDetail[];
}

export function TableDemo({ data }: TableProps) {
  // State for search input
  const [searchTerm, setSearchTerm] = useState('');

  // Validate data
  const validatedData = data.map((item) => {
    try {
      return orderSchema.parse(item); // Validate each order detail
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Validation error:', err.errors);
        return null; // Return null for invalid items
      }
      return null; // Fallback for unexpected errors
    }
  }).filter(Boolean) as OrderDetail[]; // Filter out nulls and assert type

  // Filter data based on search term
  const filteredData = validatedData.filter((orderDetail) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      orderDetail.id_order_detail.toLowerCase().includes(lowerCaseSearchTerm) ||
      orderDetail.nomor_induk.toLowerCase().includes(lowerCaseSearchTerm) ||
      orderDetail.brand.toLowerCase().includes(lowerCaseSearchTerm) ||
      orderDetail.unit.toLowerCase().includes(lowerCaseSearchTerm) ||
      orderDetail.type.toLowerCase().includes(lowerCaseSearchTerm) ||
      orderDetail.increment_id.toLowerCase().includes(lowerCaseSearchTerm) ||
      orderDetail.status_order_detail.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  return (
    <div>
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search"
          className="border rounded p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
        />
        <button className="ml-2 bg-blue-500 text-white rounded p-2">
          Search
        </button>
      </div>
      <ScrollArea className="h-screen">
        <Table>
          <TableCaption>A list of your recent orders.</TableCaption>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nomor Induk</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Request Delivery</TableHead>
              <TableHead>Increment ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((orderDetail: OrderDetail) => (
              <TableRow key={orderDetail.id_order_detail}> {/* Use a unique key */}
                <TableCell>{orderDetail.id_order_detail}</TableCell>
                <TableCell>{orderDetail.nomor_induk}</TableCell>
                <TableCell>{orderDetail.brand}</TableCell>
                <TableCell>{orderDetail.unit}</TableCell>
                <TableCell>{orderDetail.type}</TableCell>
                <TableCell>{orderDetail.qty_order}</TableCell>
                <TableCell>{orderDetail.request_delivery}</TableCell>
                <TableCell>{orderDetail.increment_id}</TableCell>
                <TableCell>{orderDetail.created_at}</TableCell>
                <TableCell>{orderDetail.updated_at || 'N/A'}</TableCell> {/* Show 'N/A' if updated_at is empty */}
                <TableCell>{orderDetail.status_order_detail}</TableCell>
                <TableCell><button className="bg-blue-500 text-white rounded p-2">View</button> | <button className="bg-red-500 text-white rounded p-2">Delete</button> | <button className="bg-green-500 text-white rounded p-2">Edit</button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

export default TableDemo;
